import mongoose from "mongoose"

const PaymentModel = new mongoose.Schema({
  uploadId: {type: String},
  empId: {type: String},
  branchId: {type: String},
  sourceAccId: {type: String},
  amountPaid: {type: Number},
  destAcct: {type: String},
  status: {type: String}
})

const Payment = mongoose.model('Payments', PaymentModel)
export default Payment