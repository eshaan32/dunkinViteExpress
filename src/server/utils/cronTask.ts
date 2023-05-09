import cron from 'node-cron'

/**
 * Starts a cron schedule that hitslocal server endpoint to create payments in Method.
 * The cron job runs every minute. 
 *
 * @param date - The date string to pass in the fetch URL.
 * @param uploadId - The ID of the upload associated with this cron job.
 */
export const startSchedule = async (date: string, uploadId: string) => {
  const task = cron.schedule('*/6 * * * *', async () => {
    
    fetch(`http://localhost:3000/payments/move/${date}`)
      .then((data) => data.json())
      .then((data) => {
        console.log(data.message)
      })
  }, {name: uploadId, scheduled: false})
  
  task.start()
}
