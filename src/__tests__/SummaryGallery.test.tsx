import { render } from "@testing-library/react";
import SummaryGallery from '../client/components/SummaryGallery';

describe("SummaryGallery", () => {
  const branches = [
    {
      branchId: 1,
      Employees: [{ name: "John", age: 25 }],
      amountPaidCurrentBatch: { amountPaid: 100 }
    },
    {
      branchId: 2,
      Employees: [{ name: "Jane", age: 30 }],
      amountPaidCurrentBatch: { amountPaid: 200 }
    }
  ];

  it("renders the modal for each branch", () => {
    const { getAllByTestId } = render(<SummaryGallery branches={branches} />);
    const modals = getAllByTestId("modal");
    expect(modals.length).toBe(branches.length);
  });

  it("renders a message when there are no branches", () => {
    const { getByText } = render(<SummaryGallery branches={[]} />);
    const message = getByText("Pizza");
    expect(message).toBeInTheDocument();
  });
});
