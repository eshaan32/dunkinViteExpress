import mongoose from 'mongoose'


const uploadModel = new mongoose.Schema({
  uploadId: {type: String, required: true},
  uploadDate: {type: String, required: true},
  processingFinished: {type: Boolean, default: false},
  paymentsFinished: {type: Boolean, default: false}
})

const Upload = mongoose.model('Uploads', uploadModel)
export default Upload