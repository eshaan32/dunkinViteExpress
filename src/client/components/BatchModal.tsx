import { useState } from 'react'

type ModalProp = {
  branchId: string,
  employees: Array<any>,
  amountPaid: number
}

/**
  * Component to render clickable summary card for branch,displaying branch ID, number of employees being paid, and amount to be paid.
  * When clicked, the component displays a modal which allows the user to edit the amount to be paid for each employee, and save the changes.
  @param {string} branchId - the ID of the branch to be displayed on the card
  @param {Array} employees - an array of objects containing information for each employee to be paid, including name, email, and amount
  @param {number} amountPaid - the total amount to be paid to all employees in the branch
  @returns {JSX.Element} - a clickable card which displays the branch summary and a modal for editing employee payment amounts
  **/
export default function Modal({ branchId, employees, amountPaid }: ModalProp) {
  const [showModal, setShowModal] = useState(false);


  return (
    <>
      <a
        data-testid='Modal'
        className="block max-w-sm my-2 min-h-8 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-orange-300 dark:border-orange-800 dark:hover:bg-orange-500"
        onClick={() => setShowModal(true)}
      >
        <h6
          data-testid='modalBranchId'
          className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-brown-800"
        >
          {branchId}
        </h6>
        <p data-testid='branchEmployeesPaid' className="font-normal text-gray-700 dark:text-fuchsia-50">Employees to be Paid: {employees.length}</p>
        <p data-testid='branchAmountPaid' className="font-normal text-gray-700 dark:text-fuchsia-50">Amount to Be Paid: ${amountPaid / 100}</p>
      </a>
      {showModal ? (
        <>
          <div className="justify-center items-center fixed flex overflow-x-hidden inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto max-w-m">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <h3 data-testid='modalBranchId' className="text-3xl font-semibold">
                    {branchId}
                  </h3>
                </div>
                {/*body*/}
                <div className="max-h-60 items-center overflow-y-auto sm:justify-center ml-4 sm:ml-0">
                  {/* <table className="text-sm border-separate border-spacing-y-2">
                    <thead className="relative border border-gray-800 ">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Company</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody className='border border-gray-800 relative'>
                      {employees.map((emp: any, idx: number) => {
                        return (
                          <tr className="tr-class" key={`employee-${idx}`}>
                            <td
                              className="td-class">
                              {emp.row.Employee.FirstName._text} {emp.row.Employee.LastName._text}
                            </td>
                            <td
                              className="td-class">
                              {emp.row.Employee.FirstName._text.toLowerCase()}.{emp.row.Employee.LastName._text.toLowerCase()}@gmail.com
                            </td>
                            <td
                              className="td-class" contentEditable={true}>${(emp.row.Amount._text / 100).toFixed(2)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>

                  </table> */}
                  <div className='flex flex-col space-y-2 justify-center p-3 '>
                    {employees.map((emp: any, idx: number) => {
                      return (
                        <div className="tr-class" key={`employee-${idx}`}>
                          <div
                            data-testid='modalEmployeeName'
                            className="td-class">
                            {emp.row.Employee.FirstName._text} {emp.row.Employee.LastName._text}
                          </div>
                          <div
                            data-testid='modalEmployeeEmail'
                            className="td-class"
                          >
                            {emp.row.Employee.FirstName._text.toLowerCase()}.{emp.row.Employee.LastName._text.toLowerCase()}@gmail.com
                          </div>
                          <div
                            data-testid='modalEmployeeAmountPaid'
                            className="td-class"
                          >
                            ${(emp.row.Amount._text / 100).toFixed(2)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}