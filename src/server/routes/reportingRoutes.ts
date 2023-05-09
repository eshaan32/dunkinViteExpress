import express, {Request, Response} from "express"
import mongoController from '../controllers/mongoController'

const reportingRouter = express.Router()

/**
 * Route to get a list of uploads for use in selecting a target upload date
**/
reportingRouter.get('/uploads', mongoController.getUploads,  (req: Request, res: Response) => {
  res.status(200).send(res.locals.uploadDates)
})

/**
 * Route to get a list of corprate accounts, used for building out the table head of reporting table component
**/
reportingRouter.get('/corps', mongoController.getCorps, (req: Request, res: Response) => {
  res.status(200).send(res.locals.corps)
})

/**
 * Route to get list of branches with payments and corp ids used to build out reporting table body
**/
reportingRouter.get('/branches/:date?', mongoController.getPayments, mongoController.getCorps, mongoController.getBranches, (req: Request, res: Response) => {
  res.status(200).send(res.locals.branches)
})

/**
 * Route to get list of pending payments for use in polling while making payments
**/
reportingRouter.get('/pendingPayments/:date', mongoController.getPendingPayments, (req: Request, res: Response) => {
  res.status(200).send(res.locals.pendingPayments)
})

/**
 * Route to get the status of a file upload/process. Used in polling while processing a file for purpose of show/hide loading spinner 
**/
reportingRouter.get('/fileUploadStatus', mongoController.getUploadStatus, (req: Request, res: Response) => {
  res.send(res.locals.status)
})

/**
 * Route to get errors in employees while processing or payments while paying, accounts while creating, etc. Used for building gallery of errors view.
**/
reportingRouter.get('/getErrors/:date?', mongoController.getErrors, (req: Request, res: Response) => {
  res.status(200).send(res.locals.listOfErrors)
})

export {reportingRouter as reportingRouter}