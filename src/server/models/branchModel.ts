import mongoose from 'mongoose'

const branchModel = new mongoose.Schema({
  corpId: {tyoe: String},
  branchId: {type: String},
  amountPaidCurrentBatch: {
    amountPaid: {type: Number, required: false},
    // cumulativeAmountPaid: {type: Number, required: false}
    cumulativeAmountPaid: {type: Map, of: Number,  required: false}
  }
})

const Branch = mongoose.model('Branches', branchModel)
export default Branch