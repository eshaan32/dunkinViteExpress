import mongoose from "mongoose"

const EmployeeModel: any = new mongoose.Schema({
  first_name: {type: String, required: true},
  last_name: {type: String},
  empId: {type: String},
  branchId: {type: String},
  loanAcctNumber: {type: String, required: true},
  plaidId: {type: String},
  entId: {type: String, required: false},
  accId: {type: String, required: false}
})


const Employee = mongoose.model('Employees', EmployeeModel)
export default Employee