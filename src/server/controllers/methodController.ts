import { Request, Response, NextFunction } from 'express'
import { Environments } from 'method-node'
import { RateLimit } from 'async-sema'
import CryptoJS from 'crypto-js'

import  { startSchedule} from '../utils/cronTask'
import { formatDate } from '../utils/helpers'

import MethodApiClient from '../MethodApiClient'
import Business from '../models/businessEntity'
import Corporation from '../models/comporateEntity'
import Employee from '../models/employeeEntity'
import ErroredEmployee from '../models/erroredEmployee'
import Merchant from '../models/merchantModel'
import Upload from '../models/uploadModel'
import Cron from '../models/cronTask'


const methodController = {
  /**
   * A Middleware function to interface with the Method Api through the Method Api Client wrapper and create entities per unique employee from summarizedPayment middleware. The entity accountId from the entity creation response object is saved to the employee for use in account creation
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns updates employee documents in MongoDb Employee Collection with method entity account id on creation
  **/
  createEntities: async (req: Request, res: Response, next: NextFunction) => {
    // fetch list of unique employee/payments
    const { summarizedPaymentData } = res.locals
    
    // initliaze our tate limit for elements per second processed
    const limit = RateLimit(8)
    
    // initialize the method api
    const api = new MethodApiClient(process.env.METHOD_DEV_KEY, Environments.dev)

    for(const ele of summarizedPaymentData) {
      // await the rate limit to avoid unnecessary procesing within the second
      await limit()

      const emp = ele.row

      // fetch associated business and employee data to create the corp entity and employee entities from
      const [employee]: any = await Employee.find({empId: emp.Employee.DunkinId._text})
      const [business] = await Business.find({})


      // CREATING THE EMPLOYEE ENTITY FOR THIS PAYMENT
      if(!employee.entId) {
        // no entity created
        const newEntity = await api.methodCreateEntity(emp)

        if(newEntity.status === 'active') {
          // creation success
          console.log(newEntity)
          // update the ID on the employee document
          employee.entId = newEntity.id
          await employee.save()
        }
      } else {
        console.log('entity exists')
      }

      // CREATING THE BUSINESS ENTITY
      if(business.entId === undefined) {
        // no business method entity
        const newBusEntity = await api.methodCreateEntity(emp, 'corporation')
        
        if(newBusEntity.status === 'active') {
          // entity creation success

          // update the ID on the business document
          business.entId = newBusEntity.id
          await business.save()
        }
      } else {
        console.log('bus entity exists')
      }
    }

    return next()
  },
  /**
   * A Middleware function to interface with the Method Api through the Method Api Client wrapper and create accounts per unique employee from summarizedPayment middleware. The account accountId from the account creation response object is saved to the employee for use in payment creation
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns updates employee documents in MongoDb Employee Collection with method entity account id on creation
  **/
  createAccounts: async (req: Request, res: Response, next: NextFunction) => {
    // middleware to create accounts
    
    // fetch list of unique employee/payments
    const { summarizedPaymentData, uploadKey } = res.locals

    const limit = RateLimit(8)

    // initialize the method api
    const api = new MethodApiClient(process.env.METHOD_DEV_KEY, Environments.dev)

    for (const payment of summarizedPaymentData) {
      // do awaits here
      
      // await the limit to only proces the certain amount
      await limit()

      const emp = payment.row

      // fetch the employee tied to the payment
      const [employee]: any = await Employee.find({empId: emp.Employee.DunkinId._text})

      const[corporation]: any = await Corporation.find({corpId: emp.Payor.DunkinId._text})

      // CREATING THE LIABILITY ACCOUNT FOR THIS EMPLOYEE
      let mchId
      if(!employee.accId) {
        // no account id created for entity

        // need to get the mchId
        // get mchId from mongo
        const merchantList: any = await Merchant.find({plaidIds: emp.Payee.PlaidId._text})

        // if mongo merchant list doesnt have, check methods list
        if (merchantList.length === 0) {
          const specialMerch = await api.findMchId(emp.Payee.PlaidId._text)

          // if method listdoesnt have, set merchantId not found
          if(specialMerch === undefined) {
            mchId = 'not found'
          } else {
            // assign merchant id the special obtained merchantId
            mchId = specialMerch
          }
        } else {
          // assign merchant Id the mongo found merchantId
          mchId = merchantList[0].mchId
        }
        
        // create an error document if merchant Id is not found
        if (mchId === 'not found') {
          // no mchId could be found. There is an error in the mchId entry
          const message = "Plaid Id is incorrect. Please double check all data points for this employee"
          const erroredEmployee = new ErroredEmployee({
            uploadId: uploadKey,
            first_name: employee.first_name,
            last_name: employee.last_name,
            empId: employee.empId,
            branchId: employee.branchId,
            loanAcctNumber: employee.loanAcctNumber,
            plaidId: employee.plaidId,
            entId: employee.entId,
            note: message
          })
          await erroredEmployee.save()
          continue
        }

        // need to get the loanAcctNumber
        // decrypyt loanAcctNumber
        // the employee document has an encrypted account number, need to decrypt
        const bytes = CryptoJS.AES.decrypt(employee.loanAcctNumber, process.env.DECRYPTION_KEY as string)
        const loanAcctNumber = bytes.toString(CryptoJS.enc.Utf8)

        // create new account through method api wrapper
        const newAccount = await api.createLiabilityAccount(employee.entId, mchId, loanAcctNumber )

        // check there is no error, update employee document with accound Id and save
        if(newAccount.error === null) {
          // account created successfully
          console.log(newAccount)
          employee.accId = newAccount.id
          await employee.save()
        } else {
          // error in account creation, add to error
          const message = 'Error in creating account. Please check loan Account number or Entity Id'
          const erroredEmployee = new ErroredEmployee({
            uploadId: uploadKey,
            first_name: employee.first_name,
            last_name: employee.last_name,
            empId: employee.empId,
            branchId: employee.branchId,
            loanAcctNumber: employee.loanAcctNumber,
            plaidId: employee.plaidId,
            entId: employee.entId,
            note: message
          })
          await erroredEmployee.save()
          continue
        }
      }

      // CREATING ACH ACCOUNT FOR THE Paying Corporation
      if(!corporation.payorId || !corporation.corpOwner) {
        // no ach account tied to payor or corp ent tied
        const [business] = await Business.find({})
        corporation.corpOwner = business.entId
        
        await corporation.save()
        
        // create new ACH account for the corprate accounts, tied to the one business
        const newAcct = await api.createAchAccount(corporation.corpOwner, corporation.routingNumber, corporation.accountNumber)

        // check for no errors
        if (newAcct.error === null) {
          console.log(newAcct)
          // ACH account created
          corporation.payorId = newAcct.id
          await corporation.save()
        }
      }
    }

    return next()
  },
  /**
   * A Middleware function to start the cron job responsible for actually creating teh payments in the background, and creating a document to be referenced for name to stop the job externally
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns creates document in MongoDb Tasks Collection, and invoked startSchedule, starting the Cron job
  **/
  startPaymentCronJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // await Cron.deleteMany({})
      const { date } = req.params
      const fDate = formatDate(date)
    
      // fetch uploadKey tied to the upload-to-be-process to name the cron job
      const [uploadDoc]: any = await Upload.find({uploadDate: fDate })
      const uploadKey = uploadDoc.uploadId
      
      // start the cron job and save status to the database
      const cronJob = new Cron({
        batchId: uploadKey
      })
    
      // do a preemptive check for the prior cron job. Depending on lag, may not complete in time and thus this will break
      // const listOfCron = await Cron.find({batchId: uploadKey})
      // if(listOfCron.length >= 1 ) {
      //   setTimeout(() => {

      //   }, 10000)
      // }
      
      // save the Cron document
      await cronJob.save()
      
      // immediately send a response to client for toast notification
      res.status(200).send({message: `Starting Payment Processing Cron Job for upload date: ${date}. May take a few minutes to start`})
      
      // start cron
      await startSchedule(date, uploadKey)
    } catch (err) {
      return next({
        log: `Error occured in methodController.startPaymentCronJob middleware, ${err}`,
        status: 400,
        message: {err: 'An error has occured while trying to query for uploadId and start cron job'}
      })
    }
  },
}

export default methodController