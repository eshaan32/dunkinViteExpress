import {Request, Response, NextFunction, ErrorRequestHandler} from "express"
import { validateRow, formatPaymentAmount, formatDate } from '../utils/helpers'

import Upload from '../models/uploadModel'
import Merchant from '../models/merchantModel'
import Corporation from '../models/comporateEntity'
import Employee from '../models/employeeEntity'
import ErroredEmployee from '../models/erroredEmployee'
import Payment from '../models/paymentInfo'
import Branch from '../models/branchModel'

import CryptoJS from 'crypto-js'
import uuid4 from 'uuid4'
import { Environments, Method } from 'method-node'

import Business from '../models/businessEntity'
import MethodApiClient from '../MethodApiClient'
import { RateLimit } from 'async-sema'

const paymentController = {
  preUpload: async (req: Request, res: Response, next: NextFunction) => {
    await Upload.deleteMany({})
    await Business.deleteMany({})
    await Corporation.deleteMany({})
    await Employee.deleteMany({})
    await Payment.deleteMany({})
    await Branch.deleteMany({})
    await ErroredEmployee.deleteMany({})
    return next()
  },
  /**
   * This middleware makes a call to the MongoDb Database Uploads collection to create an upload document representative of the currently being processed document. THis is where the unique, important uploadId is create
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns creates document in MongoDb Upload collection 
  **/
  createUpload: async (req: Request, res: Response, next: NextFunction) => {
    // this method will create a document recording a unique id for upload. This unique ID will be passed through middleware as an assignable to each document created

    const { data } = req.body

    // REMOVE THE .SLICE FOR FULL DATASET
    res.locals.data = data.slice(0,500)

    // generate the unique identifier
    const uploadKey = uuid4()
    // const uploadDate = (new Date().toISOString().substring(0,10))
    const uploadDate = '2023-05-12'

    const existingFileName = await Upload.find({uploadDate: uploadDate})

    // check for existing uploadDate in collection 
    if(existingFileName.length > 0) {
      // an upload exists with the same upload date. please wait to upload
      return next({
        log: `Error occured in paymentsController.createUpload middleware`,
        status:302,
        message: {err: 'You are not allowed to upload this file. Please wait two weeks.'}
      })
    } 
    // create the new Upload document
    const upload = new Upload({
      uploadId: uploadKey,
      uploadDate: uploadDate
    })


    // save the upload document
    await upload.save()
    
    // save the uniqueKey
    res.locals.uploadKey = uploadKey

    return next()
  },
  /**
   * This middleware makes a call to the MongoDb Database Business collection to Create the owning business document
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns crates document in MongoDb Business Collection
  **/
  createBusiness: async (req: Request, res: Response, next: NextFunction) => {
    // check for existing business creation, should only be one
    const list = await Business.find({})

    if(list.length === 0) {
      // if no existing business, create document
      const newBusiness = new Business({
        name: 'Samsung',
        ein: '123456'
      })

      // save document
      await newBusiness.save()
      return next()
    } else {
      // business exists, move to next middleware
      return next()
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database Corporate collection to create corporate accounts that will represent the paying corps
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns creates documents in MongoDb Corporation Collection
  **/
  createCorpAccounts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // fetch existing corps
      const mCorps = await Corporation.find({})
      const existingCorps = new Set(mCorps.map(e => e.corpId))
      // this middleware will create corporation account documents
      const { data, uploadKey } = res.locals
      // object to hold unique corps
      const corporations: any = {}

      const listOfCorps: any = []
      // build object of unique corps
      for(const payment of data) {
        if(!corporations[payment.row.Payor.DunkinId._text]) {
          const paymentMap = new Map()
          paymentMap.set(uploadKey, 0)

          const newData =  {
            id: payment.row.Payor.DunkinId._text,
            routingNumber: payment.row.Payor.ABARouting._text,
            accountNumber: payment.row.Payor.AccountNumber._text,
            paymentAmount: paymentMap
          }
          corporations[payment.row.Payor.DunkinId._text] = newData
          listOfCorps.push(newData)
        }
      }

      // create corp account documents and save to mongo
      for(let corps of listOfCorps) {
        if(!existingCorps.has(corps.id)) {

          // if listOfCorps does not have the currently accessed branch Id, create the document and save
          const corp: any = new Corporation({
            corpId: corps.id,
            routingNumber: corps.routingNumber,
            accountNumber: corps.accountNumber,
            paymentAmount: corps.paymentAmount
          })
  
          await corp.save()
        }
      }

      return next()
    } catch (err) {
      return next({
        log:  `Error occured in the paymentController.createCorpAccounts middleware, ${err}`,
        status: 400,
        message: {err: 'An error has occured when creating a corporate entities and save the payment/employee list'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database Merchants collection collection to create documents representing most common merchants attached to method. Used for quicker access when making accounts
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns creates documents MongoDb Merchants Collection
  **/
  createMerchants: async (req: Request, res: Response, next: NextFunction) => {
    // this middleware will create and store merchants by plaidId
    try {
      // check if the collection is already populated
      const existingMerchants = await Merchant.find({})
      if(existingMerchants.length > 0) {
        return next()
      }

      const method = new Method({
        apiKey: 'sk_KTkCaAqx7k6nWV6RzJyQr4Rx',
        env: Environments.dev
      })

      // fetch list of merchants
      const list = await method.merchants.list({})
      
      // loop thorugh the merchant list, creating documents with merchantId and plaidId
      for(const merchant of list) {
        const merch = new Merchant({
          parentName: merchant.parent_name,
          plaidIds: merchant.provider_ids.plaid,
          mchId: merchant.mch_id
        })
        
        // save the merchant info to mongo for quicker access than pinging method
        await merch.save()
      }
      return next()
    } catch (err) {
      return next({
        log: `Error occured in paymentController.createMerchants middlwarre, ${err}`,
        status: 400,
        message: {err: 'An error has occured while trying to query method API for a list of merchants to then save to Mongo'}
      })
    }
  },
  /**
   * This middleware is the first step in processing the large data set. It takes in the raw json and loops through it, building out an object that summarizes payments accross the same employee to a single key/value pairing for quicker processing down the line. 
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns creates a summarized list of the raw input file, by employee not payment
  **/
  createSummary: async (req: Request, res: Response, next: NextFunction) => {
    // this middleware takes in the raw payment data and summarizes it, making further post-processing faster.

    const { data, uploadKey } = res.locals

    const mapOfEmployees: any = {}

    for (const el of data) {
      // each element is an object with a key of row

      if(!validateRow(el)) {
        const message = 'Employee validation failed. Please check all datapoints for this employee'
        const erroredEmployee = new ErroredEmployee({
          uploadId: uploadKey,
          first_name: el.row.Employee.FirstName._text,
          last_name: el.row.Employee.LastName._text,
          empId: el.row.Employee.DunkinId,
          branchId: el.row.Employee.DunkinBranch,
          loanAcctNumber: el.row.Payee.Account._text  ,
          plaidId: el.row.Payee.plaidId._text,
          note: message
        })
        await erroredEmployee.save()
        continue
      }
      // if the employee doesnt exist in the map, add it as a key with initial value of an empty array, this is too push our employees 
      if(!mapOfEmployees[el.row.Employee.DunkinId._text]) {
        if(el.row.Employee.FirstName === 'tara') console.log('found tara')
        mapOfEmployees[el.row.Employee.DunkinId._text] = el
        mapOfEmployees[el.row.Employee.DunkinId._text].row.Amount._text = formatPaymentAmount(el.row.Amount._text)
      } else {
        // employee exists in map, so add the formatted amount from el to the employee in the object
        mapOfEmployees[el.row.Employee.DunkinId._text].row.Amount._text += formatPaymentAmount(el.row.Amount._text)
      }
    }
    res.locals.summarizedPaymentData = Object.values(mapOfEmployees)
    return next()
  },
  /**
   * This middleware makes a call to the MongoDb Database Employees collection to create employee documents based on the input from the summarized payment middleware. THese employees will hold teh data necessary for account creation, entity creation, and other tasks
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns creates documents in MongoDb Emplyoees Collection
  **/
  createEmployees: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { summarizedPaymentData } = res.locals

      // as summarizedPaymentData is already unique employees, can process the employee builder here
      for(const ele in summarizedPaymentData) {
        const emp = summarizedPaymentData[ele].row

        // check for existing
        const existemp = await Employee.find({empId: emp.Employee.DunkinId._text})
        if(existemp.length > 0) {
          continue
        }
        
        // create the new employee and encrypt the account number in the process
        const employee = new Employee({
          first_name: emp.Employee.FirstName._text,
          last_name: emp.Employee.LastName._text,
          empId: emp.Employee.DunkinId._text,
          loanAcctNumber: CryptoJS.AES.encrypt(emp.Payee.LoanAccountNumber._text, process.env.DECRYPTION_KEY as string).toString(),
          branchId: emp.Employee.DunkinBranch._text,
          plaidId: emp.Payee.PlaidId._text
        })

        // save the employee document to the datbase
        await employee.save()
      }

      return next()

    } catch (err) {
      return next({
        log: `Error occured in paymentController.createEmployees middleware, ${err}`,
        status: 400,
        message: {err: 'An error has occured while trying to create unique employees'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database Payments collection to create Payment documents based on input from summarized payment middleware. These payments wil hold information necessary to create payments in Method and reference for branch or corporate source account
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns creates documents in MongoDb Payments Collection
  **/
  createPayments: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { summarizedPaymentData, uploadKey } = res.locals
      
      // loop through the summarized list, creating payments and saving to mongo
      for(const ele of summarizedPaymentData) {
        const paymentData = {
          uploadId: uploadKey,
          empId: ele.row.Employee.DunkinId._text,
          branchId: ele.row.Employee.DunkinBranch._text,
          sourceAccId: ele.row.Payor.DunkinId._text,
          amountPaid: ele.row.Amount._text,
          status: 'pending'
        }

        const completePayment = new Payment(paymentData)
        await completePayment.save()
      }

  
      // AT THIS POINT, AtlasDB should have payments in both collections
      return next()
    } catch (err) {
      return next({
        log: `Error occured in paymentController.createPayments middleware, ${err}`,
        status: 400,
        message: {err: 'An error has occured while trying to validate the payment/employee information, and summmarizing payment totals per employee'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database Branches collection create the branch documents necessary to represent the branches employees are connected to. Contain a map for holding summation of payments per upload
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns creates documents in MongoDb Branches Collection
  **/
  createOrSaveBranches: async (req: Request, res: Response, next: NextFunction) => {    
    try {
      const { summarizedPaymentData, uploadKey } = res.locals

      // fetch data to check for existing branches
      const branches = await Branch.find({})

      
      // reset the branch current amount paid to 0 if branches exist to represent new upload amounts
      if(branches.length >0) {
        // lets incorporate a check for prior existence of branches
        await Branch.updateMany({}, {$set: {'amountPaidCurrentBatch.amountPaid': 0}})
      }

      // make a set of existing branches to use as check for already existing
      const existingBranches = new Set(branches.map(el => el.branchId))

      // create the branches summary used for client side rendering
      const branchesSummary: any = {}
      
      // creating object of branchesSummary
      for(const ele of summarizedPaymentData) {
        // if the branch object doesn't exist in the uniqueBranches object, create it following the Branch model

        // building the branch summary
        if(!branchesSummary[ele.row.Employee.DunkinBranch._text]) {
          // the branch associated with this payment is not yet in the branchesSummary object
          const branchData: any = {}
          const amountPaidCurrentBatch: any = {}

          branchData.corpId = ele.row.Payor.DunkinId._text
          branchData.branchId = ele.row.Employee.DunkinBranch._text
          
          amountPaidCurrentBatch.amountPaid = ele.row.Amount._text

          // creating the map to hold payments for uploadId
          const newCum: any = new Map()
          newCum.set(uploadKey, ele.row.Amount._text) 
          amountPaidCurrentBatch.cumulativeAmountPaid = newCum

          branchData.amountPaidCurrentBatch = amountPaidCurrentBatch

          // list to store employees
          branchData.Employees = [ele]

          branchesSummary[ele.row.Employee.DunkinBranch._text] = branchData
        
        } else {
          // if it exists in the uniqueBranches, add to the balances paid out the current ele's amounts to be paid 
          branchesSummary[ele.row.Employee.DunkinBranch._text].amountPaidCurrentBatch.amountPaid += ele.row.Amount._text

          // add the employee to the branch list if branch id = uniqueId
          branchesSummary[ele.row.Employee.DunkinBranch._text].Employees.push(ele)

          // update paidAmounts 
          let branchAmount = branchesSummary[ele.row.Employee.DunkinBranch._text].amountPaidCurrentBatch.cumulativeAmountPaid.get(uploadKey) 
          branchAmount += ele.row.Amount._text
          branchesSummary[ele.row.Employee.DunkinBranch._text].amountPaidCurrentBatch.cumulativeAmountPaid.set(uploadKey, branchAmount)

        }
      }
      
      for(const uniqueBranch in branchesSummary) {
        // if the object does not exist in the database, then we create a new document and save it to the collection
        if(!existingBranches.has(branchesSummary[uniqueBranch].branchId)) {
          const branch: any = new Branch(branchesSummary[uniqueBranch])

          branch.amountPaidCurrentBatch.amountPaid = 0
          branch.amountPaidCurrentBatch.cumulativeAmountPaid.set(uploadKey, 0)

          await branch.save()
        }
      }

      // save objects from values of branchesSummary as an array in local storage
      res.locals.uniqueBranches = Object.values(branchesSummary)

      // send the response immediately after data structure for rendering is made, allowing entity and account creations to continue in background
      res.status(200).send(res.locals.uniqueBranches)
      return next()
    } catch (err) {
      return next({
        log: `Error occured in paymentController.createOrSaveBranches, ${err}`,
        status: 400,
        message: {err: 'An error has occured while trying to create and save unique branches'}
      })
    }
  },

  /**
   * This middleware is triggered by the chron job, first fetches a list of pending payments by the uploadId, then loops over the list, utilizing the Method Api Client to process payments and update status' in Mongo for 'processing' on success or 'failed' on error. 
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns makes payments through Method Api, saving status to payment document in MongoDb
  **/
  processPayments: async (req: Request, res: Response, next: NextFunction) => {
    // console.log('entered process Payments')
    const {date} = req.params
    const fDate = formatDate(date)

    const uploadDoc: any = await Upload.find({uploadDate: fDate })
    const uploadKey = uploadDoc[0].uploadId

    
    // initialize a methodAPiClient
    const api = new MethodApiClient(process.env.METHOD_DEV_KEY, Environments.dev)
    
    // define the rate limit
    const limit = RateLimit(8)
    
    
    // fetch a list of the 500 payments
    const listOfPendingPayments = await Payment.find({$and: [{uploadId: uploadKey}, {status: 'pending'}]}).limit(500)
    res.send({message: `Starting movement of ${listOfPendingPayments.length} payments`})
    console.log('🚀 ~ file: paymentsController.ts:455 ~ processPayments: ~ listOfPendingPayments:', listOfPendingPayments, listOfPendingPayments.length)
    console.log('🚀 ~ file: paymentsController.ts:456 ~ processPayments: ~ listOfPendingPayments length:', listOfPendingPayments.length)

    // escape clause
    if(listOfPendingPayments.length === 0) return
    const start = Date.now()
    for (const payment of listOfPendingPayments) {
      // do awaits here
      // await limit()

      // payment is stored in variable payment
      const amountPaid = payment.amountPaid as number
  
      // fetch the employeeToBePaid attached to the payment
      const [empTBP]: any = await Employee.find({empId: payment.empId})
      
      // fetch the corporationPaying account attached to the payment
      const [corpP]: any = await Corporation.find({corpId: payment.sourceAccId})
      
      if(!empTBP.accId || !corpP.payorId) {
        // one of the accounts has not been set up appropriately.
        // assign a failed status
        payment.status = 'failed'
        await payment.save()
        
        // skip payment
        continue
      }
  
      // intialize consts for the method accIds to be used in payment creation
      const corpAccId = corpP.payorId
      const empAccId = empTBP.accId

      // interface with method api to make payment
      const newPayment = await api.makePayment(empAccId, corpAccId, amountPaid)
      console.log('🚀 ~ file: paymentsController.ts:481 ~ processPayments: ~ newPayment:', newPayment)

      // check for successful payment creation
      if(newPayment?.status === 'pending') {
        // successful payment initiated
        payment.status = 'processing'

        // also want to add the amountPaid to the cumulative amount paid in the branches
        // fetch the branch to update
        const [branch]: any = await Branch.find({branchId: empTBP.branchId})
        
        // assign the current amountPaid to a variable to be updated
        let cur = branch.amountPaidCurrentBatch.amountPaid

        // update the amountPaid with the new payment amount
        cur += amountPaid

        // update the payment values in branch document and corporate document attached to this payment
        branch.amountPaidCurrentBatch.amountPaid = cur
        branch.amountPaidCurrentBatch.cumulativeAmountPaid.set(uploadKey, cur)
        corpP.paymentAmount.set(uploadKey, cur)
        
        await branch.save()
        await corpP.save()
        await payment.save()

      } 
      else {
        const bytes = CryptoJS.AES.decrypt(empTBP.loanAcctNumber, process.env.DECRYPTION_KEY as string)
        const loanAcctNumber = bytes.toString(CryptoJS.enc.Utf8)
        // payment errored. Create a new payment and store in MongoDb
        const message = 'Payment failed in creation. Please double check the employee account and entity details'
        const erroredPayment = new ErroredEmployee({
          uploadId: uploadKey,
          first_name: empTBP.first_name,
          last_name: empTBP.last_name,
          empId: empTBP.DunkinId,
          branchId: empTBP.DunkinBranch,
          loanAcctNumber: loanAcctNumber ,
          plaidId: empTBP.plaidId,
          note: message
        })
        await erroredPayment.save()
      }
    }
    const end = Date.now()
    console.log('TIME in SECONDS: ', (start - end) / 1000)
    return next()
  },
}

export default paymentController