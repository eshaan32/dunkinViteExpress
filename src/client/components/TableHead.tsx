import { useEffect, useState } from 'react'

type TableHeadProp = {
  branches: Array<any>,
  setSource: (sources: Array<any>) => void
}

/**
 * Generates a table header row with the given column names as elements.
 * The "data" parameter represents an array of column names to be included in the header.
 * @param {any} data the array of column names
 * @returns {JSX.Element} a JSX element representing the table header row
**/
const TableHead = ({ branches, setSource }: TableHeadProp) => {

  const [data, setData] = useState<any>([])

  /**
   * A React useEffect hook that fetches data from the server and updates data state. Rarely, if effer triggered, but done when branches dependency (result of upload) changes.
   * @param branches - the value(s) that determine when the hook should be triggered. When `branches` changes, the hook is triggered.
   */
  useEffect(() => {

    const fetchData = async () => {
      // fetch the list of corporate accounts
      const list = await fetch(`http://localhost:3000/reporting/corps`)
      // await the resolution of the promise
      const sources = await list.json()

      // set the sources to be used for rendering logic in the reporting table as well as local data state component with the list of corporate accounts
      setData(sources)
      setSource(sources)
    }

    fetchData()
  }, [branches])

  return (
    <>
      {
        ['Branch Id', ...data].map((ele: any, idx: any) => {
          return (
            <th
              scope="col"
              className="px-6 py-3"
              key={`branch-${idx}`}
            >
              {ele}
            </th>
          )
        })
      }
    </>
  )
}

export default TableHead