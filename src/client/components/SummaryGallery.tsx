import Modal from './BatchModal'

type SummaryProp = {
  branches: Array<any>
}

/**
 * A React component that renders a list of branches with their respective data in the form of a modal that displays employee information when clicked.
 * @param branches - an array of branch objects containing data to be displayed
 * @returns a div containing the list of branches with respective modal representation
**/
const SummaryGallery = ({ branches }: SummaryProp) => {

  return (
    <div className='sm:rounded-lg sm:shadow-xl pt-3'>
      <div className="overflow-y-scroll mx-3 overflow-hidden h-96 border-6 border-orange-900 grid grid-cols-2 md:grid-cols-3 gap-4">
        {branches.length > 0 && branches.map((branch: any) => (
          <Modal data-testid='modal' key={branch.branchId} branchId={branch.branchId} employees={branch.Employees} amountPaid={branch.amountPaidCurrentBatch.amountPaid} />
        ))}
        {branches.length === 0 && <h2>Pizza</h2>}
      </div>
    </div>
  )
}

export default SummaryGallery

