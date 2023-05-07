import { render, fireEvent, findByText } from "@testing-library/react";
import CsvExporter from '../client/components/CsvExporter';


describe('It should render the CsvExporter component with button functionality', () => {
  test('Should render Source Funds button ', async () => {
    const { getByText } = render(<CsvExporter sDate='2023-05-08' />)
    expect(getByText('Per Source Funds')).toBeInTheDocument()
  })

  test('Should render Source Funds button ', async () => {
    const { getByText } = render(<CsvExporter sDate='2023-05-08' />)
    expect(getByText('Per Branch Funds')).toBeInTheDocument()
  })

  test('Should render Source Funds button ', async () => {
    const { getByText } = render(<CsvExporter sDate='2023-05-08' />)
    expect(getByText('Payments and Metadata')).toBeInTheDocument()

  })
})
