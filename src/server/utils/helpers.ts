export const validateRow = (obj: any) => {
  // basic validation of dunkinId
  // Check if the object has the expected properties
  if (!obj.hasOwnProperty("row") ||
      !obj.row.hasOwnProperty("Employee") ||
      !obj.row.hasOwnProperty("Payor") ||
      !obj.row.hasOwnProperty("Payee") ||
      !obj.row.hasOwnProperty("Amount")) {
    // console.log('basic val failed')
    return false;
  }

  // Check the formatting of the Employee object
  const emp = obj.row.Employee;
  if (!emp.hasOwnProperty("DunkinId") ||
      !emp.hasOwnProperty("DunkinBranch") ||
      !emp.hasOwnProperty("FirstName") ||
      !emp.hasOwnProperty("LastName") ||
      !emp.hasOwnProperty("DOB") ||
      !emp.hasOwnProperty("PhoneNumber") ||
      typeof emp.DunkinId._text !== "string" ||
      typeof emp.DunkinBranch._text !== "string" ||
      typeof emp.FirstName._text !== "string" ||
      typeof emp.LastName._text !== "string" ||
      typeof emp.DOB._text !== "string" ||
      typeof emp.PhoneNumber._text !== "string") {
        // console.log('employee property failed')
    return false;
  }

  // Check the formatting of the Payor object
  const payor = obj.row.Payor;
  if (!payor.hasOwnProperty("DunkinId") ||
      !payor.hasOwnProperty("ABARouting") ||
      !payor.hasOwnProperty("AccountNumber") ||
      !payor.hasOwnProperty("Name") ||
      !payor.hasOwnProperty("DBA") ||
      !payor.hasOwnProperty("EIN") ||
      !payor.hasOwnProperty("Address") ||
      typeof payor.DunkinId._text !== "string" ||
      typeof payor.ABARouting._text !== "string" ||
      typeof payor.AccountNumber._text !== "string" ||
      typeof payor.Name._text !== "string" ||
      typeof payor.DBA._text !== "string" ||
      typeof payor.EIN._text !== "string" ||
      !payor.Address.hasOwnProperty("Line1") ||
      !payor.Address.hasOwnProperty("City") ||
      !payor.Address.hasOwnProperty("State") ||
      !payor.Address.hasOwnProperty("Zip") ||
      typeof payor.Address.Line1._text !== "string" ||
      typeof payor.Address.City._text !== "string" ||
      typeof payor.Address.State._text !== "string" ||
      typeof payor.Address.Zip._text !== "string") {
        // console.log('payor property failed')
    return false;
  }

  // Check the formatting of the Payee object
  const payee = obj.row.Payee;
  if (!payee.hasOwnProperty("PlaidId") ||
      !payee.hasOwnProperty("LoanAccountNumber") ||
      typeof payee.PlaidId._text !== "string" ||
      typeof payee.LoanAccountNumber._text !== "string") {
        // console.log('payee property failed')
    return false;
  }

  // Check the formatting of the Amount property
  const amount = obj.row.Amount;
  if (typeof amount._text !== "string" ) {
    // console.log('amount property failed')
    return false;
  }

  // If we reached this point, all objects were validated successfully
  return true;
}

/**
 * Takes an input amount paid in the form of a string, and uses regex to strip away the dollar sign and convert to cents, then parseInt to convert to number
 *
 * @param amount - the amount paid in the form of '$DD.CC'
 * @returns {number} the amount paid in the form of CCCC 
 */
export const formatPaymentAmount = (amount: String): number => {
  return parseInt(amount.replace(/[^0-9]+/g, ""))
}

/**
 * Takes a date in the form YYYYMMDD and converts to YYYY-MM-DD
 *
 * @param {string} date - The date string to convert
 * @returns {string} the converted date 
 */
export const formatDate = (date: string): string => {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  return `${year}-${month}-${day}`;
}