import mongoose from "mongoose"
import { ConnectionOptions } from 'tls'
const URI = process.env.VITE_MONGO_URI as string 

/**
   * This is a helper function make the conection to the Mongo Database. This is invoked with the app.listen event listener in the server file
   * @returns connects to Mongo Database
  **/

export function connectToDatabase() {
    // open connection to MongoDb
    mongoose.connect(URI, 
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      } as ConnectionOptions
    )
    .then(() => {
      console.log('Connected to Mongo Database')
    })
    .catch((error) => {
      console.log(error)
    })
}