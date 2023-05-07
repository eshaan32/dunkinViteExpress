import "./App.css";
import { useState } from "react";
import * as helpers from "./utils/helpers";
import { toast } from 'react-toastify';

import logo from './assets/DunkinLogo.png'

import ReportingTable from './components/ReportingTable';
import FileUpload from './components/FileUpload';
import SummaryGallery from './components/SummaryGallery';
import BatchSelection from './components/BatchSelection';
import PaymentStatusPoll from './components/PaymentStatusPoll';
import CsvExporter from './components/CsvExporter';
import FileProcessStatusPoll from './components/FileProcessStatusPoll';
import ErrorEmployees from './components/ErrorEmployees';

function App() {
  const [message, setMessage] = useState<string>('')
  const [sDate, setsDate] = useState<string>('')
  const [showErrorOrReport, setShowErrorOrReport] = useState<string>('Report')

  const [file, setFile] = useState<any>(null);

  const [branches, setBranches] = useState<any>([])
  const [branch, setBranch] = useState<any>([])

  const [warningColor, setWarningColor] = useState<boolean>(false)
  const [paymentStart, setPaymentStart] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)


  /**
   * Method to handle the selection of a date representing an upload. Triggered by date selection in Uploads list
   * @param e - the event parameter
   * @returns - no return, rather sets branch(singular) to ress to signal selected branch for reporting table
   */
  const handleDateSelection = async (e: any) => {
    e.preventDefault()

    // get date from the event target element
    const date = e.target.innerHTML

    // set the selected date
    setsDate(date)

    // make the fetch request to /reporting/branches passing in a query param of date
    const res = await fetch(`http://localhost:3000/reporting/branches/${date}`)
    const ress = await res.json()

    setBranch(ress)
  }


  /**
   * Method to handle the upload of a file. Utilizes external functions parseTextAsXML to convert the xml object to a json for processing. Triggered by Upload button
   * @param e the event parameter
   * @returns - no return, rather sets branches to render summary table as well as trigger the batch selection fetch
   */
  const handleFileUpload = async (e: Event) => {
    e.preventDefault()
    // validate the file upload
    if (!file) {
      setMessage('Please drop a file to upload')
      return
    }

    // validate that the file upload is of correct type
    if (file.type === 'text/xml' || file.type === 'application/xml') {
      // change the text color back to grey 
      if (warningColor === true) {
        const changedWarning = !warningColor
        setWarningColor(changedWarning)
      }
      toast('Validating upload. If validation success, summary generation will begin', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 300
      })
      // set loading before all the heavy processing begins
      setIsLoading((isLoading: boolean) => !isLoading)
      // now begin heavy processing

      // initialize the FileReader
      const reader = new FileReader()

      // read the file as text 
      reader.readAsText(file)

      // once the text is processed, wait for onloadend event then fire the callback
      reader.onloadend = (async (event: any) => {
        // get the text
        const text = event.target.result
        // paarse text to get JSON
        const result = await helpers.parseTextAsXML(text)

        // make the post request to create ull necessary documentation in MongoDb as well as method entities and accounts
        fetch('http://localhost:3000/payments/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: result })
        })
          .then((response) => {
            return response.json()
          })
          .then((response) => {
            // console.log(response)
            if (response.err) {
              // there was an unauthorized upload. stop the poll
              setIsLoading(isLoading => !isLoading)

              toast('Please wait two weeks to upload a new payment file', {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2500
              })
            } else {
              toast('Creating your Method Entities and Accounts. May take a few minutes', {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2500
              })
              setBranches(response)
            }
          })
      })
    } else {
      // console.log('not an xml')
      // switch the warning color to true, changing text color to red to show an erronous input
      setWarningColor(true)
      setMessage('Please ensure the upload is of type XML')
    }
  };


  /**
   * Method to call the route to start the payment processing. Triggered by Start {date} Payments button
   * @param e - the event parameter
   * @returns - no return. rather, sets payment start to trigger the poll
   */
  const startPaymentProcessing = async (e: any) => {
    e.preventDefault()

    // check if no date has been selected and send a notifcation
    if (sDate === "") {
      toast('Pick an upload date to process that upload\'s payments', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2500
      })
      return
    }

    // set the paymnetStart boolean to trigger the poll

    const date = sDate.split('-').join('')
    // make the get request to /payments/startPayments
    fetch(`http://localhost:3000/payments/start/${date}`)
      .then(response => response.json())
      .then((response) => {
        toast(response.message, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2500
        })
        setPaymentStart((paymentStart) => !paymentStart)
      })
  }


  return (
    <>
      {/* Header Component */}
      <div className=" relative mx-16 mb-3 pb-2 pr-5 flex flex-row justify-between space-x-96">
        <img src={logo} alt="Dunkin Logo" className=' w-64 ' />
        {paymentStart ? <PaymentStatusPoll sDate={sDate} status={paymentStart} setPaymentStart={setPaymentStart} /> : <></>}
        {isLoading && <FileProcessStatusPoll sDate={sDate} setIsLoading={setIsLoading} isLoading={isLoading} />}
      </div>



      <div className='flex h-1/2'>
        <div className={`${branches.length > 0 ? 'w-1/3' : 'mx-auto w-1/3'}`}>
          <FileUpload warningColor={warningColor} message={message} handleFileUpload={handleFileUpload} setFile={setFile} file={file} />
        </div>
        <div className={`${branches.length > 0 ? 'flex-1 pr-6' : 'hidden'}`}>
          <SummaryGallery branches={branches} />
        </div>
      </div>

      <div className='flex my-10 '>

        <div className='w-1/3 flex flex-col items-center text-center space-y-5'>
          <button className="py-2 px-4 font-bold border rounded-lg border-gray-500 inline-flex w-3/4 bg-orange-300 hover:bg-orange-400 text-brown-800 " onClick={startPaymentProcessing}>
            <span className='mx-auto'>{sDate ? `Start ${sDate} Payment` : 'Choose date to start payment'}</span>
          </button>
          <BatchSelection paymentStart={paymentStart} sDate={sDate} branches={branches} handleDateSelection={handleDateSelection} />
          <CsvExporter sDate={sDate} />
          <div className=' w-3/4 mx-auto mb-5 border text-brown-800 border-gray-500 bg-orange-300 rounded-lg hover:bg-orange-400 text-base'>
            <h3>
              Current View:
              <button className='ml-2'
                onClick={(e) => {
                  e.preventDefault()
                  showErrorOrReport === 'Report'
                    ? setShowErrorOrReport('Error')
                    : setShowErrorOrReport('Report')
                }}
              > {showErrorOrReport === 'Report'
                ? 'Planned Payments'
                : 'Errored Employees'
                }</button>
            </h3>
          </div>
        </div>

        <div className={`rounded-b-lg rounded-t-sm sm:shadow-lg max-h-96 max-w-5/8 p-3 flex-1 overflow-x-scroll overflow-y-scroll `}>
          {showErrorOrReport === 'Report' &&
            <ReportingTable branch={branch} setBranch={setBranch} branches={branches} />}
          {showErrorOrReport === 'Error' &&
            <ErrorEmployees sDate={sDate} />}
        </div>

      </div>
    </>
  );
}

export default App;