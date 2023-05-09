import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import express from "express";
import ViteExpress from "vite-express";
import cors from "cors"

import {Request, Response, NextFunction, ErrorRequestHandler} from "express"
import { connectToDatabase } from './db/dbConn'

import { paymentRouter } from './routes/paymentRoutes'
import { reportingRouter } from './routes/reportingRoutes';

const app = express();
const PORT:number = parseInt(process.env.PORT as string)|| 3000

app.use(cors())
app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded());

/**
 * Router containing all routes pertaining to payment processing, document creating, payment fetching for branch or source 
**/
app.use('/payments', paymentRouter)

/**
 * Router containing all routes pertaining to Mongo fetching, getting lists of only corporate accounts, or Ids
**/ 
app.use('/reporting', reportingRouter)



app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  return res.status(errorObj.status).json(errorObj.message);
});

ViteExpress.listen(app, PORT,
  () =>{
    connectToDatabase()
    console.log(`Server is listening on port ${PORT}...`)
  }
);
