import { useState } from 'react'
import { useInterval } from '../hooks/useInterval'

type PaymentPollProp = {
  status: boolean
  setPaymentStart: (status: any) => void,
  sDate: string
}

/**
 * Component that polls the server at a regular, customizable(delay) interval to check the status of pending payments.
 * Uses the useInterval hook to make a request to the server every 5 seconds.
 * @param status the status of payments
 * @returns a div displaying the number of pending payments
**/
const PaymentStatusPoll = ({ status, setPaymentStart, sDate }: PaymentPollProp) => {

  const [numPayments, setNumPayments] = useState(0)

  const minute = 60000

  // initalize a delay to 5 seconds. This delay can be customized
  let delay: number | null = minute / 12

  //invoke the custom useInterval hook to begin the polling fetch requests for remaining pending payments
  useInterval(async () => {
    // make polling request

    // check status. this will return before the fetch call for the oddly timed second the callback is invoked before the interval is stopped
    if (!status) return

    // fetch amount of payments
    const amount = await fetch(`http://localhost:3000/reporting/pendingPayments/${sDate}`)
    // await the resolution of the promise
    const amountPending = await amount.json()

    // set numPayments with the amount to be rendered in the polling message

    setNumPayments(amountPending.length)

    // check that there are no more pending payments => stop poll
    if (amountPending.length === 0) {
      // set the delay to null and flip paymentStart boolean -> false to end poll
      setPaymentStart((status: boolean) => !status)
      delay = null
    }
  }, delay)

  return (
    <>
      <div className='flex flex-col my-6 max-w-lg px-4 py-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-orange-300 dark:border-gray-500'>
        <h5 className=' text-2xl font-bold tracking-tight text-brown-800 dark:text-brown-800'>You have {numPayments} payments remaining</h5>
        <p className='font-normal dark:text-fuchsia-50'> In upload {sDate} </p>
      </div>
    </>
  )
}

export default PaymentStatusPoll