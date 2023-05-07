import { kStringMaxLength } from 'buffer'
import mongoose from 'mongoose'

const erroredPaymentsModel = new mongoose.Schema({
  uploadId: {type: String, required: true},
  first_name: {type: String, required: true},
  last_name: {type: String},
  empId: {type: String},
  branchId: {type: String},
  loanAcctNumber: {type: String, required: true},
  plaidId: {type: String},
  entId: {type: String, required: false},
  note: {type: String, required: true}
})  

const ErroredEmployee = mongoose.model('Errors', erroredPaymentsModel)

export default ErroredEmployee