import { useState } from 'react'
import { useInterval } from '../hooks/useInterval'

type FileStatusProp = {
  sDate: string,
  setIsLoading: (status: any) => void,
  isLoading: boolean

}

/**
 * Component that polls the server at a regular, customizable(delay) interval to check the status of the fileUpload.
 * Uses the useInterval hook to make a request to the server every 5 seconds.
 * @param {string} sDate - the date of the uploaded file
 * @param {Function} setIsLoading - the setState function for the isLoading state component. Triggered upon resolution of the fetch promise
 * @param {boolean} isLoading - the stateful component to represent the default state of the file upload completion, false, until status is switched by the server in Mongo
 * @returns a div with a loading circle
**/
const FileProcessStatusPoll = ({ sDate, setIsLoading, isLoading }: FileStatusProp) => {

  const minute = 60000

  // initalize a delay to 5 seconds. This delay can be customized
  let delay: number | null = minute / 12

  //invoke the custom useInterval hook to begin the polling fetch requests for status checking
  useInterval(async () => {
    // make polling request

    // fetch amount of payments
    const status = await fetch(`http://localhost:3000/reporting/fileUploadStatus`)
    // await the resolution of the promise
    const uploadStatus = await status.text()


    // check that the uploadStatus on the processing upload has been switched to true, meaning all entities and accounts are done processing
    if (uploadStatus === 'true') {
      // switch the isLoading 
      console.log('file done processing')
      setIsLoading(() => !isLoading)
      delay = null
    }
  }, delay)

  return (
    <div role="status" className='mt-4 w-24 h-24'>
      <svg aria-hidden="true" className="inline w-24 h-24 mr-2 animate-spin dark:text-orange-500 fill-pink-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default FileProcessStatusPoll