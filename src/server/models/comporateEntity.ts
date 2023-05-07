import mongoose from "mongoose"

const CorporateEntity = new mongoose.Schema({
  corpId: {type: String},
  payorId: {type: String, required: false},
  routingNumber: {type: String, required: true},
  accountNumber: {type: String, required: true},
  corpOwner: {type: String, requred: false},
  paymentAmount: {type: Map, of: Number, required: true}
})

const Corporation = mongoose.model('Corporations', CorporateEntity)
export default Corporation