import { render, fireEvent, waitFor } from '@testing-library/react';

import FileUpload from '../client/components/FileUpload';

function setupFetchStub(data: any) {
  return function fetchStub(_url: string) {
    return new Promise((resolve) => {
      resolve({
        json: () =>
          Promise.resolve({
            data,
          }),
      })
    })
  }
}
const someValues = [{ name: 'teresa teng' }];

describe('should render the fileUpload component with all text and buttons', () => {
  // it('should call setFile when a file is selected', () => {
  //   const setFile = jest.fn();
  //   const file = new File(['(⌐□_□)'], 'test.xml', { type: 'text/xml' });
  //   const { getByLabelText } = render(<FileUpload setFile={setFile} file={file} warningColor={false} message='blah blah blah' handleFileUpload={setupFetchStub} />);

  //   const fileInput = getByLabelText('file upload');
  //   fireEvent.change(fileInput, { target: { files: [file] } });

  //   expect(setFile).toHaveBeenCalledWith(file);
  // });

  // it('should call handleFileUpload when the upload button is clicked', () => {
  //   const handleFileUpload = jest.fn();
  //   const { getByText } = render(<FileUpload handleFileUpload={handleFileUpload} />);

  //   const uploadButton = getByText('Upload');
  //   fireEvent.click(uploadButton);

  //   expect(handleFileUpload).toHaveBeenCalled();
  // });

  test('Should render the fileUpload service alongside the display message', async () => {
    const setFile = jest.fn();

    const str = JSON.stringify(someValues);
    const blob = new Blob([str]);
    const file = new File([blob], 'values.json', {
      type: 'application/JSON',
    });
    File.prototype.text = jest.fn().mockResolvedValueOnce(str);

    const fileUpload = render(<FileUpload setFile={setFile} file={null} warningColor={false} message='' handleFileUpload={setupFetchStub} />);

    const initMessage = fileUpload.getByText('Drag & Drop your files here')
    expect(initMessage).toBeInTheDocument()

    const input = fileUpload.getByTestId('fileUploadInput');
    fireEvent.change(input, file)
    expect(setFile).toHaveBeenCalledTimes(1)

  });
});
