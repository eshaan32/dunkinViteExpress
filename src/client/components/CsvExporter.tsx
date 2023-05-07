import fileDownload from 'js-file-download'
import { toast } from 'react-toastify';

type CsvExporterProp = {
  sDate: string
}

/**
 * A React component to download a certain type of CSV depending on what the user is looking for. Renders three buttons with onclicks, invoking handleCsvOption
 * @param {string} sDate - the selected date from the uploads list component 
 * @returns 
 */
const CsvExporter = ({ sDate }: CsvExporterProp) => {

  /**
   *  This function handles the exporting of specific types of csv files depending on user selection.Sends fetch request to server with selected type and upload date then downloads the file using the fileDownload library.
   * @param e - The event object for the csv option select element for prevent default
   * @returns {JSX.Element} - The rendered component.
  **/
  const handleCsvOption = async (e: any) => {
    e.preventDefault()

    // grab the type (source branch or payment/metadata)
    const type = e.target.value

    // check if no date selection. throw notification
    if (sDate === "") {
      toast(`Pick an upload date to download that upload\'s ${type !== 'payments' ? `${type}'s payments` : `payments`}`)
      return
    }

    // fetch the title from the TypeMap based on grabbed type above
    const typeMap: any = { 'source': 'SourceFunds_', 'branch': 'BranchFunds_', 'payments': 'PaymentsAndMetaData' }
    const csvType: any = typeMap[type]

    // make a fetch request to handle the exporting of the specific type of csv file
    fetch(`http://localhost:3000/payments/csv/${type}/${sDate}`)
      .then((data) => data.blob())
      .then((data) => {
        // console.log(data)
        // download the file named with the type grabbed above plus the date of upload selected
        fileDownload(data, `${csvType}_${sDate}.csv`)
      })
  }

  return (
    <>
      <div className="inline-flex w-3/4 mt-4 border border-gray-500 rounded-lg" role="group">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium border-r border-gray-200 rounded-l-lg hover:bg-gray-100 focus:z-10 -700 dark:bg-orange-300 dark:border-gray-500 dark:text-brown-800 dark:hover:bg-orange-500 dark:focus:text-white"
          onClick={handleCsvOption}
          value='source'
        >
          Per Source Funds
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium border-r hover:bg-gray-100 focus:z-10  dark:bg-orange-300 dark:border-gray-500 dark:text-brown-800  dark:hover:bg-orange-500 dark:focus:text-white"
          onClick={handleCsvOption}
          value='branch'
        >
          Per Branch Funds
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium rounded-r-lg hover:bg-gray-100 focus:z-10 -700 dark:bg-orange-300 dark:border-gray-500 dark:text-brown-800 dark:hover:bg-orange-500 dark:focus:text-white"
          onClick={handleCsvOption}
          value='payments'
        >
          Payments and Metadata
        </button>
      </div>
    </>
  )
}

export default CsvExporter