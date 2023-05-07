import { useEffect, useState } from 'react'
import TableHead from './TableHead'

type ReportingProp = {
  branch: Array<any>,
  setBranch: (list: Array<any>) => void,
  branches: Array<any>
}

/**
 * This component renders a table with dynamic data. It maps over branches and creates a table with more dynamic data.
 * The component uses a state variable 'source' that is passed down as a prop to the TableHead component. The 'source' variable is an array of all source accounts obtained from mongoDb.
 * This component uses a map function to render table rows that are mapped
 * across a list of all branches. 
 * @param branch an array of objects representing the branch data
 * @param setBranch function to update the branch state variable
 * @param branches the current list of branches
 * @returns - a table with dynamic data based on the fetched 'branch' and 'source' data.
 */
const ReportingTable = ({ branch, setBranch, branches }: ReportingProp) => {
  const [source, setSource] = useState<any>([])

  /**
   * useEffect hook to fetch a list of branches from a local server and set the state variable 'branch' to the fetched data.
   * This hook will be called every time the 'branches' state variable is updated
   * @returns - no return value, but sets 'branch' state variable to the fetched data
  **/
  useEffect(() => {
    const fetchBranches = async () => {
      // fetch the data 
      const data = await fetch('http://localhost:3000/reporting/branches')
      // await the resolution of the promise
      const listOfBranches = await data.json()

      // set the list to the branch state for rendering
      setBranch(listOfBranches)
    }
    fetchBranches()
  }, [branches])

  return (

    // map over branches, creating the table with more dynamic data
    <div className="relative overflow-x-auto shadow-md border rounded-t-lg border-gray-500 max-h-96">
      <table className="w-full text-sm text-left text-gray-800 dark:text-gray-400">
        <thead className="sticky top-0 text-xs border-b border-gray-500 text-gray-100 uppercase bg-gray-50 dark:bg-orange-300 dark:text-brown-800">
          <tr >
            <TableHead branches={branches} setSource={setSource} />
            <th scope="col" className="px-6 py-3">
              Branch Total
            </th>
          </tr>
        </thead>

        <tbody className='overflow-y-auto'>

          {/* need a map for table rows, mapped accross a list of all branches */}
          {branch.map((ele: any, idx: Number) => {
            return (
              <tr key={idx.toString()} className="border-b bg-gray-50 dark:bg-pink-400 dark:border-gray-700 ">
                <td className="px-6 py-4 font-medium text-fuchsia-50 whitespace-nowrap dark:text-fuchsia-50">{ele.branchId}</td>
                {source.map((el: any, idx: Number) => {
                  return <td
                    className="x-6 py-4 text-center text-fuchsia-50"
                    key={`${idx}`}
                  > ${(ele.payments[el] / 100).toFixed(2)} </td>
                })}
                <td className="x-6 py-4 text-center text-fuchsia-50">${((ele.totalPayment) / 100).toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ReportingTable