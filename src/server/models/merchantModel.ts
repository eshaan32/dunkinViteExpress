import mongoose from 'mongoose';

const MerchantModel = new mongoose.Schema({
  parentName: {type: String, required: true},
  plaidIds: {type: [String], required: true},
  mchId: {type: String, required: true}
})

const Merchant = mongoose.model('merchants', MerchantModel)
export default Merchant