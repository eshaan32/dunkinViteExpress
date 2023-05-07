import mongoose from 'mongoose';

const CronModel = new mongoose.Schema({
  status: {type: String, default: 'on'},
  batchId: {type: String, required: true}
})

const Cron = mongoose.model('tasks', CronModel)
export default Cron