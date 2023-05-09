import { Request, Response, NextFunction } from 'express'
import {  formatDate } from '../utils/helpers'
import { Environments } from 'method-node'

import {createObjectCsvWriter} from 'csv-writer'

import cron from 'node-cron'
import { RateLimit } from 'async-sema'

import Employee from '../models/employeeEntity'
import Corporation from '../models/comporateEntity'
import Branch from '../models/branchModel'
import Upload from '../models/uploadModel'
import Payment from '../models/paymentInfo'
import ErroredPayment from '../models/erroredEmployee'

import MethodApiClient from '../MethodApiClient'
import Cron from '../models/cronTask'
import { sortAndDeduplicateDiagnostics } from 'typescript'
import ErroredEmployee from '../models/erroredEmployee'

const mongoController = {
  /**
   * This middleware makes a call to the MongoDb Database uploads collection to update the upload
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns updates the processingFinished status of a completely processed document to true
  **/
  updateUpload: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uploadKey } = res.locals

      const [upload] = await Upload.find({uploadId: uploadKey})

      upload.processingFinished = true

      await upload.save()
      
      return next()
    } catch(err) {
      return next({
        log: `Error in mongoController.updateUpload middleware, ${err}`,
        status: 400,
        message: {err: 'An error occured while trying to update the flag for finished processing'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database employees collection to fetch a list of all employees
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns a list of employees from MongoDb
  **/
  getEmployees: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // fetch employee
      const listOfEmployees = await Employee.find({})

      // save the list of employees to local storage
      res.locals.listOfEmployees = listOfEmployees
      
      return next()
    } catch (err) {
      return next({
        log: `Error occured in mongoController.getEmployees middleware, ${err}`,
        status: 400,
        message: {err: 'An error has occured while trying to fetch a list of employees from MongoDb'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database payments collection to fetch a list of all payments per specific uploadId or most recent upload
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns a list of payments from MongoDb
  **/
  getPayments: async (req: Request, res: Response, next: NextFunction) => {
    try {      
      let uploadKey
      
      if(!req.params.date) {
        const uploadDoc: any = await Upload.find({}).sort({uploadDate: -1})

        if(uploadDoc.length === 0) return res.send(200)
        uploadKey = uploadDoc[0].uploadId

      } else {
        // get the req param
        const { date } = req.params
        // get the uniqueUpload Key 
        const uploadDoc: any = await Upload.find({uploadDate: date })

        uploadKey = uploadDoc[0].uploadId 

      }
      
      // fetch the payments
      const listOfPayments = await Payment.find({uploadId: uploadKey})


      res.locals.date = req.params.date
      res.locals.paymentList = listOfPayments
      return next()

    } catch (err) {
      return next({
        log: `Error occured in mongoController.getPayments middleware, ${err}`,
        status: 400,
        message: {err: 'An error occured while trying to query for payments from MongoDb'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database branches collection to fetch a list of all branches and format data structure to represent payments within branches as welles
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns a list of branches from MongoDb
  **/
  getBranches: async (req: Request, res: Response, next: NextFunction) => { 
   // this middleware will fetch all payments based on the passed in uniqueId, essentially a date filter
   try {    
    // get list of payments from local storage
    const { paymentList, corps } = res.locals

    // now that we've obtained a list of payments, create a list of branches from this list of payments
    const branches: any = {}
    paymentList.forEach((ele: any) => {

      const branchId = ele.branchId
      const sourceId = ele.sourceAccId

      // build out an object for the 5 sources, with an intial val of 0
      const sourcesObj = corps.reduce((acc: any, val: any) => {
        acc[val] = 0
        return acc
      }, {})

      // set the payment amount for the unique source corp acct
      sourcesObj[sourceId] = ele.amountPaid

      // set the new data object in the branches object under the specific branchId if it doesnt exist yet
      if(!branches[branchId]) {
        branches[branchId] = {
          branchId: branchId,
          payments: sourcesObj
        }
      } else {
        // if exist, sum existing amount paid with new
        branches[branchId].payments[sourceId] += ele.amountPaid
      }
    })

    // for each branch calculate the sum of payments
    for(const branch in branches) {
      const sumOfPayments = Object.values(branches[branch].payments).reduce((a: any, b: any) => a + b, 0)
      branches[branch].totalPayment = sumOfPayments
    }

    // create an array of the value objects from the branches key/value pairs
    const listOfBranches: any = Object.values(branches)
    
    res.locals.branches = listOfBranches
    return next()
    
  } catch (err) {
    return next({
      log: `Error occured in mongoController.getBatches middleware, ${err}`,
      status: 400,
      message: {err: 'An error occured while trying to fetch a list of batches that paid in the requested cycle from MongoDb'}
    })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database uploads collection to fetch a list of all uploads
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns a list of uploads from MongoDb
  **/
  getUploads: async (req: Request, res: Response, next: NextFunction) => {
    // this middleware will get a list of all uploads to be rendered by the selection tool
    try {

      // fetch list of uploads from Mongo
      const listOfUploads = await Upload.find({}).sort({uploadDate: -1})

      // make a new array with dates and status of payments
      const dates = listOfUploads.map((el: any) => {
        return {date: el.uploadDate, status: el.paymentsFinished }
      })

      // save list to local storage
      res.locals.uploadDates = dates
      return next()
    }
    catch (err) {
      return next({
        log: `Error occured in mongoController.getUploads middleware, ${err}`,
        status: 400,
        message: {err: 'An error has occured while trying to fetch a list of all uploads from MongoDb'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database corporate collection to fetch a list of all corporate accounts
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns a list of corporate accounts by Id from MongoDb
  **/
  getCorps: async (req: Request, res: Response, next: NextFunction ) => {
    try {

      // fetch a list of Corps from corp model
      const listOfSources = await Corporation.find({})

      // make a new array for only corpId
      const filteredList = listOfSources.map(el => el.corpId)

      // store this array of corps in localstorage
      res.locals.corps = filteredList

      return next()
    } 
    catch (err) {
      return next({
        log: `Error occured in mongoController.getSources middleware, ${err}`,
        status: 400,
        message: {err: 'An error has occured while trying to fetch a list of all sources from MongoDb'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database payments collection to fetch a list of all pending payments per date. It will also be responsible for ending the paymentProcess cron job
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns a list of pending payments from MongoDb. Stops Cron Job
  **/
  getPendingPayments: async (req: Request, res: Response, next: NextFunction) => {
    // this middleware will get a list of all payments which are still in pending status
    try {
      // fetch list from mongo
      const { date } = req.params
      
      // fetch uploadId associated with upload being processed
      if(!req.params.date) {
        return next()
      } else {

        // find upload associated with payment processing to fetch the uploadId and consequently Cron Job
        const [upload] = await Upload.find({uploadDate: date})

        const uploadKey = upload.uploadId
  
        // get a count of the remaining pending payments
        const countOfPending = await Payment.countDocuments({$and: [{uploadId: uploadKey}, {status: 'pending'}]})

        // find the Cron job associated with the payment
        const runningTask = await Cron.find({$and: [{status: 'on'}, {batchId: uploadKey}]})
        
        if(runningTask) {

          // fetch upload id from runninTask as that is directly tied to cronTasks map of tasks
          const uploadId = runningTask[0].batchId
    
          // check if num pending payments is 0 => payments done processing
          if(countOfPending === 0) {
            // all payments from the batch are processed

            // reassign the paymentsFinished flag to true and save
            upload.paymentsFinished = true
            await upload.save()
  

            // fetch the list of cron tasks to find the one running to stop
            const listOfTasks = cron.getTasks()
            const paymentProcessor: any = listOfTasks.get(uploadId)

  
            if (listOfTasks.has(uploadId)) {
              // the uploadId exists in our task manager

              // turn off the Cron job, both actually and in database
              runningTask[0].status = 'off'
              paymentProcessor.stop()
  
              // save status in mongo
              await runningTask[0].save()
  
            }
          }
        }
        res.locals.pendingPayments = {length: countOfPending}

        return next()
      }

      
    } catch (err) {
      return next({
        log: `Error occured in mongoController.getPendingPayments middleware, ${err}`,
        status: 400,
        message: {err: 'An error has occured while trying to fetch a list of Payment documents that have a pending status in MongoDb'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database corporate collection to fetch all corporate accounts and their payments per specified upload date, then export that list as csv
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns a list of corporate accounts by Id alongside their payments in the form of a csv
  **/
  getSourceFunds: async (req: Request, res: Response, next: NextFunction) => {
    // middleware to get total funds paid out by each source
    try {
      const { type, date } = req.params
      if(type !== 'source') return next()

      const [uploadDoc]: any = await Upload.find({uploadDate: date})
      const uploadKey = uploadDoc.uploadId
  
      // create the csvWriter
      const path = '/Users/eshaan/Documents/dunkinViteExpress/src/server/csvFiles/'
      const csvWriter = createObjectCsvWriter({
        path: `${path}_Sources_${date}.csv`,
        header: [
          {id: 'corpId', title: 'Source Id'},
          {id: 'amountPaid', title: 'Funds Paid'},
        ]
      })

      // create map of objects to be written as rows in csv
      const listOfSources = await Corporation.find({})
      const mapOfData = listOfSources.map((doc: any) => {
        return {
          corpId: doc.corpId,
          amountPaid: doc.paymentAmount.get(uploadKey) 
                      ? `$${(doc.paymentAmount.get(uploadKey) / 100).toFixed(2)}`
                      : `00.00`
        }
      })

      // write csv using the csvWriter, then send the download to client side
      csvWriter.writeRecords(mapOfData)
        .then(() => {
          res.download(`${path}_Sources_${date}.csv`)
        })

    } catch (err) {
      return next({
        log: `Error occured in mongoController.getSourceFunds middleware, ${err}`,
        status: 400,
        message: {err: 'An error occured while trying to query mongo for funds paid by sources to export for csv'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database Branches collection to fetch all branches and their payments per specified upload date, then export that list as csv
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns a list of branches by Id and their payments in the form of a csv
  **/
  getBranchFunds: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, date } = req.params
      if(type !== 'branch') return next()
  
  
      const [uploadDoc]: any = await Upload.find({uploadDate: date})
      const uploadKey = uploadDoc.uploadId
  
      // create the csvWriter
      const path = '/Users/eshaan/Documents/dunkinViteExpress/src/server/csvFiles/'
      const csvWriter = createObjectCsvWriter({
        path: `${path}_Branches_${date}.csv`,
        header: [
          {id: 'branchId', title: 'Branch Id'},
          {id: 'amountPaid', title: 'Funds Paid'},
        ]
      })
      
      // create map of objects to be written as rows in csv
      const listOfBranches = await Branch.find({})
      const mapOfData = listOfBranches.map((doc: any) => {
        return {
          branchId: doc.branchId, 
          amountPaid: doc.amountPaidCurrentBatch.cumulativeAmountPaid.get(uploadKey) 
                    ? `$${(doc.amountPaidCurrentBatch.cumulativeAmountPaid.get(uploadKey) / 100).toFixed(2)} `
                    : `00.00`
        }
      })

      // write csv using the csvWRiter, then send the download to client side
      csvWriter.writeRecords(mapOfData)
        .then(() => {
          res.download(`${path}_Branches_${date}.csv`)
        })

    } catch (err) {
      return next({
        log: `Error occured in mongoController.getBranchFunds middleware, ${err}`,
        status: 400,
        message: {err: 'An error has occured while trying to query MongoDb for funds paid by branches to export for csv'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database Payments collection to fetch all payments and their metadata per specified upload date, then export that list as csv
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns a list of payments and their metadata in the form of a csv
  **/
  getPaymentsMetadata: async (req: Request, res: Response, next: NextFunction) => {
    // this middleware will take the list of payments and make a csv
    try { 
      // fetch date and list of payments 
      const { date } = req.params
      
      const [uploadDoc]: any = await Upload.find({uploadDate: date})
      const uploadKey = uploadDoc.uploadId

      const listOfPayments = await Payment.find({uploadId: uploadKey})

      // set tthe path for file upload
      const path = '/Users/eshaan/Documents/dunkinViteExpress/src/server/csvFiles/'

      // create the csvWriter
      const csvWriter = createObjectCsvWriter({
        path: `${path}_PaymentsAndMetadata_${date}.csv`,
        header: [
          {id: 'employeeId', title: 'Employee Id'},
          {id: 'paymentSource', title: 'Corporate Source'},
          {id: 'branchSource', title: 'Branch Source'},
          {id: 'amountPaid', title: 'Funds Paid'},
          {id: 'status', title: 'Status'}
        ]
      })

      // create map of objects to be written as rows in csv
      const mapOfData = listOfPayments.map((ele: any) => {
        return {
          employeeId: ele.empId,
          paymentSource: ele.sourceAccId,
          branchSource: ele.branchId,
          amountPaid: (ele.amountPaid / 100).toFixed(2),
          status: ele.status
        }
      })

      // write recrods using the csvWriter
      csvWriter.writeRecords(mapOfData)
        .then(() => {
          res.download(`${path}_PaymentsAndMetadata_${date}.csv`)
        })
    } catch (err) {
      return next({
        log: `Error occured in mongoController.getPaymentsMetadata midleware, ${err}`,
        status: 400,
        message: {err: 'An error occured when trying to write the csv and download'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database Uploads collection to fetch the status of the most recently uploaded (that is the currently being process file upload) and returns that boolean to the client 
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns a boolean representing the state of processing for an upload
  **/
  getUploadStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // fetch uploads from MongoDb
      const uploads = await Upload.find({})

      // initialze a constant t hold the status
      const uploadStatus: boolean = uploads[uploads.length-1].processingFinished

      // save status to local storage
      res.locals.status = uploadStatus === true ? 'true' : 'false'

      return next()
    } catch(err) {
      return next({
        log: `Error occured in mongoController.getUploadStatus middleware, ${err}`,
        status:400,
        message: {err: 'An error has occured while trying to get the status of the selected upload'}
      })
    }
  },
  /**
   * This middleware makes a call to the MongoDb Database Errors collection to fetch a list of Employees whom have erronous datapoints, disallowing the processing and creating of their payment. This list is rendered in client side under the Error View
   * @param req an optional request param or query
   * @param res the response object
   * @param next next function
   * @returns a list of erronous employees
  **/
  getErrors: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if(!req.params.date) {
        // onload

        // fetch errors
        const potentialListOfErrors = await ErroredEmployee.find({})

        res.locals.listOfErrors = potentialListOfErrors
        return next()
      } else {
        const {date} = req.params

        // fetch upload by date
        const [upload] = await Upload.find({uploadDate: date})

        // assign the uploadId to a constant 
        const uploadKey = upload.uploadId
  
        // fetch list of errored employees from the errors collection
        const listofErrors = await ErroredEmployee.find({uploadId: uploadKey})

        // save list to local storage
        res.locals.listOfErrors = listofErrors
        return next()
      }      
    } catch (err) {
      return next({
        log: `Error occured in mongoController.getErrors middleware, ${err}`,
        status: 400,
        message: {err: 'An error has occured whil trying to query MongoDb for errored employees'}
      })
    }
  }
}

export default mongoController