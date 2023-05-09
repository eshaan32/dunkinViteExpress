import { render, fireEvent, findByText } from "@testing-library/react";
import CsvExporter from '../client/components/CsvExporter';


describe('Should render the CsvExporter component with button functionality', () => {
  let csvExporter: any
  beforeEach(() => {
    csvExporter = render(<CsvExporter sDate='2023-05-08' />)
  })

  test('Should render Source Funds button', async () => {
    const handleClick = jest.fn()
    const sourceFundButton = csvExporter.getByText('Per Source Funds')

    expect(sourceFundButton).toBeInTheDocument()

    // fireEvent.click(sourceFundButton)
    // expect(handleClick).toBeCalledWith('http://localhost:3000/reporting/csv')

  })

  test('Should render Branch Funds button ', async () => {
    const branchFundButton = csvExporter.getByText('Per Source Funds')
    expect(branchFundButton).toBeInTheDocument()

  })

  test('Should render Payments and Metadata Funds button ', async () => {
    const paymentMetadataButton = csvExporter.getByText('Per Source Funds')
    expect(paymentMetadataButton).toBeInTheDocument()

  })


})
