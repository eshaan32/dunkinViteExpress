import mongoose from 'mongoose';

const BusinessModel = new mongoose.Schema({
  name: {type: String, required: true},
  ein: {type: String, required: true},
  entId: {type: String, required: false}
})

const Business = mongoose.model('businesses', BusinessModel)
export default Business