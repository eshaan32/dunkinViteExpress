import * as convert from 'xml-js'

/**
 * Parses the given text as XML and returns it as JSON format.
 * @param  - the text to parse as XML
 * @returns - an array of payment data in JSON format
 */
export async function parseTextAsXML(text: any) {
  // create a new DOM parser to parse the text file
  const parser = new DOMParser()
  
  // use the DOM Parser to parse text 
  let xmlDom = parser.parseFromString(text, "text/xml")
  
  // create array from the XML dom object
  const arrOfPayments = Array.from(xmlDom.getElementsByTagName('row'))

  const paymentsInJson: any = []

  arrOfPayments.forEach((xmlRow) => {
    // convert xmlRow to a string
    const xmlToString = new XMLSerializer().serializeToString(xmlRow)
    const xmlStringToObj = convert.xml2json(xmlToString, { compact: true, spaces: 4 })
    paymentsInJson.push(JSON.parse(xmlStringToObj))
  })

  return paymentsInJson 
}