import { useCallback, useEffect, useState } from 'react'

type ErrorEmployeesProp = {
  sDate: string
}

const ErrorEmployees = ({ sDate }: ErrorEmployeesProp) => {
  const fetchData = useCallback(async () => {
    // fetch data from reporting/getErrors endpoint, querying mongoDb errors collection
    let errors = null
    if (sDate === "") {
      errors = await fetch('http://localhost:3000/reporting/getErrors')
    } else {
      errors = await fetch(`http://localhost:3000/reporting/getErrors/${sDate}`)
    }
    // await resolution of the promise
    const errorEmployees = await errors.json()

    // set the stateful erroredEmployees value to the resulting errorEmployees array for render
    setErroredEmployees(errorEmployees)
  }, [sDate])

  // state to hold the employees fetched
  const [erroredEmployees, setErroredEmployees] = useState<Array<any>>([])

  useEffect(() => {

    fetchData()


  }, [fetchData])

  // initialize a loading card 
  const loadingCards = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  return (
    <>
      {/* <div className='sticky top-0 h-1 border-l border-r border-gray-500'></div> */}
      <div className='relative overflow-x-auto overflow-hidden h-100 border-6 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-4'>
        {erroredEmployees.length > 0 && erroredEmployees.map((emp: any, idx: number) => (
          // <Modal key={branch.branchId} branchId={branch.branchId} employees={branch.Employees} amountPaid={branch.amountPaidCurrentBatch.amountPaid} />

          // CREATE CARD 
          <div key={`ErrorEmployee-${idx}`}
            className='border border-gray-500 bg-orange-300 h-56 relative rounded-lg p-1 sm:p-6 lg:pt-1'
          >
            <div className='sm:flex sm:justify-between sm:gap-4'>
              <div>
                <p className='mt-1 text-md font-bold text-gray-600'>{emp.first_name} {emp.last_name}</p>
                <p className='text-xs text-gray-900 sm:text-xs'>
                  {emp.note}
                </p>
              </div>
            </div>

            <div className='mt-2 flex flex-row'>
              <div className='flex flex-col'>
                <p className='max-w-[55h] text-xs text-gray-500 mb-2'>
                  <span className='font-bold'> empId:</span> {emp.empId}
                </p>
                <p className='max-w-[44ch] text-xs text-gray-500'>
                  <span className='font-bold'>branchId:</span> {emp.branchId}
                </p>
              </div>
            </div>

            <dl className='mt-4 flex m-auto '>
              <div className=' mx-auto flex-col-reverse'>
                <dd className='text-xs  text-gray-500'><span className='font-bold'>Batch Id:</span> {emp.uploadId} </dd>
                <dt className='text-sm font-medium text-gray-600'>PlaidId: {emp.plaidId}</dt>
              </div>
            </dl>

          </div>
        ))}
        {erroredEmployees.length === 0 && <h2></h2>}
      </div>
    </>
  )
}

export default ErrorEmployees