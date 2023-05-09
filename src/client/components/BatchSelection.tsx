import { useState, useEffect } from 'react'

type BatchSelectionProp = {
  branches: Array<any>,
  handleDateSelection: (e: any) => void,
  sDate: string,
  paymentStart: boolean
}

/**
 * This component renders a list of dates that correspond to XML uploads. Fetches list of uploads from server via `useEffect` and sets dates in `date`state component. Renders list of dates in series of buttons,
 * Each button has an onClick function, to change the data rendered in the reporting table
 * @param {Array} branches - a list of branches to be used as a dependency for the useEffect
 * @param {Function} handleDateSelection - Method to handle the selection of a date representing an upload. Triggered by date selection in Uploads list
**/
const BatchSelection = ({ paymentStart, branches, handleDateSelection, sDate }: BatchSelectionProp) => {

  const [date, setDate] = useState<Array<string>>([])


  useEffect(() => {
    // fetch request to a get reporting/uploads endpoint
    const fetchData = async () => {
      const listOfDates = await fetch('http://localhost:3000/reporting/uploads')
      const dates = await listOfDates.json()
      // set the dates to be rendered
      setDate(dates)
    }

    fetchData()
  }, [branches, paymentStart])

  return (
    <>
      <div className=" w-3/4 text-sm h-48 overflow-y-scroll mx-auto  overflow-hidden flex flex-col items-center font-medium bg-white border border-gray-200 rounded-lg dark:bg-pink-400 dark:border-gray-500 dark:text-white">

        <h2 className="sticky top-0 text-2xl font-semibold pt-2 block w-full px-4 py-2 mb-0 text-brown-800 border-b border-gray-200 rounded-t-lg dark:bg-orange-300 dark:border-gray-500">Uploads</h2>

        {date.map((ele: any, idx: any) => {
          return (
            <button
              className={`block w-full px-4 py-2 border-b ${ele.status === true ? 'text-emerald-300' : 'text-fuchsia-50'} border-gray-200 cursor-pointer hover:bg-gray-100  dark:border-gray-500 dark:hover:bg-pink-300  dark:focus:ring-gray-500  dark:focus:bg-pink-300`}
              onClick={(e) => handleDateSelection(e)}
              key={idx}
            >
              {ele.date}
            </button>
          )
        })}
      </div>
    </>
  )
}

export default BatchSelection