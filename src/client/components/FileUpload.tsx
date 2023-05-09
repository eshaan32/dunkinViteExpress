type FileUploadProp = {
  setFile: (e: any) => void,
  handleFileUpload: (e: any) => void,
  file: any,
  message: string | null,
  warningColor: boolean
}

/**
 * FileUpload component that allows users to upload an XML file and send to server for processing
 *
 * @param {Object} props - The component props.
 * @param {Function} setFile - The function to set the selected file.
 * @param {Function} handleFileUpload - The function to handle file upload.
 * @param {Object} file - The selected file object.
 * @param {string} message - The message to display.
 * @param {boolean} warningColor - The boolean to switch warning vs normal color in file upload componentlea.
 * @returns {JSX.Element} - The rendered component.
**/
const FileUpload = ({ setFile, handleFileUpload, file, message, warningColor }: FileUploadProp) => {

  /**
   * Function to handle file changes and update the file state.
   *
   * @param {object} e - The event object passed to the function
   * @return {void}
  **/
  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className=" font-sans text-gray-900">
      <div className="flex justify-center w-full mx-auto sm:max-w-lg">

        <div className="flex flex-col items-center justify-center w-full h-auto my-10 bg-white sm:w-3/4 sm:rounded-lg sm:shadow-xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold mb-2">Upload your files</h2>
            <p className={`text-xs ${warningColor ? 'text-red-500' : 'text-grey-500'}`}>File should be of format .xml</p>
          </div>
          <form className="relative w-4/5 h-32 max-w-xs mb-14 bg-gray-100 rounded-lg shadow-inner">
            <input data-testid='fileUploadInput' type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
            <label htmlFor="file-upload" className="z-20 flex flex-col-reverse items-center justify-center w-full h-full cursor-pointer ">
              <p data-testid='messageDisplay' className="z-10 text-xs font-light text-center text-gray-500">{file ? file.name : message ? message : 'Drag & Drop your files here'}</p>
              <svg className="z-10 w-8 h-8 r text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
              </svg>
            </label>
            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 mt-2 font-bold py-2 px-4 rounded inline-flex items-center" onClick={handleFileUpload}>
              <svg className="rotate-180 fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" /></svg>
              <span>Upload</span>
            </button>

          </form>
        </div>
      </div>
    </div>

  )
}

export default FileUpload