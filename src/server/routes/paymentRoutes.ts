import express, {Request, Response, NextFunction} from "express"
import paymentController from '../controllers/paymentsController'
import mongoController from '../controllers/mongoController'
import methodController from '../controllers/methodController'

const paymentRouter = express.Router()

/**
 * Route to create upload and process the file data, interfacing with Mongo and then method for entity and account creation
**/
paymentRouter.post('/process',
  // paymentController.preUpload,
  paymentController.createMerchants,
  paymentController.createUpload,
  paymentController.createSummary,
  paymentController.createBusiness,
  paymentController.createCorpAccounts,
  paymentController.createEmployees,
  paymentController.createPayments,
  paymentController.createOrSaveBranches,
  methodController.createEntities,
  methodController.createAccounts,
  mongoController.updateUpload)

/**
 * route to get called by the chron job, processing the payments in batch
**/
paymentRouter.get('/move/:date', 
  paymentController.processPayments, 
  (req: Request, res: Response) => {})

/**
 * Route to get corp, branch, and individual payments to buid out reporting table
**/
paymentRouter.get('/reports/:uploadId/:type', 
  mongoController.getSourceFunds, mongoController.getBranchFunds, 
  mongoController.getPayments, 
  (req: Request, res: Response) => {
  res.status(200)
})

/**
 * Route to get the csv downloads for the three type params for any selected ulpoad date
**/
paymentRouter.get('/csv/:type/:date',
  mongoController.getSourceFunds, 
  mongoController.getBranchFunds, 
  mongoController.getPaymentsMetadata, 
  (req: Request, res: Response) => {
  res.status(200)
})

/**
 * Route to start the cron job, with a parameter for selected upload date used to query the specific upload target
**/
paymentRouter.get('/start/:date', 
  methodController.startPaymentCronJob, 
  (req: Request, res: Response, next:NextFunction) => {
  res.status(200)
})

export {paymentRouter as paymentRouter}