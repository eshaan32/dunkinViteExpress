# Method Financial Assessment

This project is a full-stack assessment for Method, the fintech startup. The product is a Loan Payment Dashboard for Dunkin Donut, with capabilities to upload large XML files of payments, then process and execute those payments through the Method API.

## Features

- Upload service for serving XML data.
- Tabled report for planned payments, filterable by upload date.
- Downloadable CSV files for detailed look into payments by multiple categories (per branch or per source account).
- Responsive design.

## Installation and Setup

1. Clone the repository:

```bash
git clone 
```

2. Install dependencies:

```bash
cd DunkinDashboard
npm install
```
3. Set Environment Variables:

```javascript
VITE_MONGO_URI = 'INSERT YOUR MONGO URI'
METHOD_DEV_KEY = 'INSERT YOUR METHOD DEV KEY'
DECRYPTION_KEY = 'INSERT YOUR OWN DECRYPTION KEY HERE'
PORT           = 'CHOOSE A PORT TO HOST EXPRESS SERVER. BY DEFAULT 3000'
```

3. Start the development server:

```bash
npm run dev
```

4. Running Tests:

```bash
npm test
```


The application should now be running on `http://localhost:5173` with the Express server on \`http://localhost:3000\`.

## Technologies

- React
- Express
- MongoDB
- Tailwind
- Method
- CSS

## Project Structure

- \`src/client\`: Parent folder encapsulating all front-end filesystem.
  - \`src/client/assets\`: Contains svgs for tab icon and company logo.
  - \`src/client/components\`: Contains react components used in application.
  - \`src/client/hooks\`: Contains custom hooks used in application.
  - \`src/client/utils\`: Contains utility functions used in the front end

- \`src/server\`: Contains all the React components used in the application.
  - \`src/server/controllers\`: Contains all the Express middleware components.
  - \`src/server/csvFiles\`: Contains the csvFiles to be downloaded once written.
  - \`src/server/db\`: Contains the function to create connection to the MongoDb.
  - \`src/server/models\`: Contains the Mongoose Models used in the MongoDb.
  - \`src/server/routes\`: Contains the Express Routers used by the Express server.
  - \`src/server/utils\`: Contains the utility functions used by the Express middleware.

- \`src/tests\`: Contains test files.

## Author

Eshaan Joshi

## License

This project is licensed under the MIT License.