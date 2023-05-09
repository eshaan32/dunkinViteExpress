import { render, screen, fireEvent } from '@testing-library/react';
import { TopologyDescriptionChangedEvent } from 'mongodb';
import Modal from '../client/components/BatchModal';

const mockProps = {
  branchId: 'BRC-bbfbdfe5-0173-4613-8b07-aadb828e67f6',
  employees: [
    {
      row: {
        Employee: {
          FirstName: { _text: 'John' },
          LastName: { _text: 'Doe' },
        },
        Amount: { _text: '2000' },
      },
    },
    {
      row: {
        Employee: {
          FirstName: { _text: 'Jane' },
          LastName: { _text: 'Doe' },
        },
        Amount: { _text: '3000' },
      },
    },
  ],
  amountPaid: 5000,
};

describe('Should render the standalone modal component with ability to open and close', () => {
  let modal: any
  beforeEach(() => {
    modal = render(<Modal branchId={mockProps.branchId} employees={mockProps.employees} amountPaid={mockProps.amountPaid} />);
  })

  test('renders Modal component', async () => {
    const modalElem: any = modal.getByTestId('Modal')
    expect(modalElem).toBeInTheDocument()

    const branchIdElem = modal.getByTestId('modalBranchId')
    expect(branchIdElem).toBeInTheDocument()
    expect(branchIdElem.textContent).toBe(mockProps.branchId)

    const employeesElement = modal.getByTestId('branchEmployeesPaid');
    expect(employeesElement).toBeInTheDocument();

    const amountPaidElement = modal.getByTestId('branchAmountPaid')
    expect(amountPaidElement).toBeInTheDocument();
  });

  test('opens and closes modal on click', () => {
    const button = modal.getByTestId('Modal');
    expect(button).toBeInTheDocument()
    fireEvent.click(button)

    // modal opens, now should be rendering both the parent modal branch ID and the popup branch Id
    let modalHeaderElement = modal.getAllByText(mockProps.branchId);
    expect(modalHeaderElement).toHaveLength(2);

    // close modal to hide
    const closeButton = modal.getByText('Close');
    fireEvent.click(closeButton);
    modalHeaderElement = modal.getAllByText(mockProps.branchId)
    expect(modalHeaderElement).toHaveLength(1)
  });
});