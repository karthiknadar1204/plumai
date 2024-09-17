import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [generatedCode, setGeneratedCode] = useState({ jsx: '', css: '' });
  const [cssType, setCssType] = useState('');
  const [additionalInput, setAdditionalInput] = useState('');

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleCssTypeChange = (event) => {
    setCssType(event.target.value);
  };

  const handleAdditionalInputChange = (event) => {
    setAdditionalInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('framework', selectedOption);
    formData.append('cssType', cssType);
    formData.append('additionalInput', additionalInput);

    try {
      const response = await axios.post('http://localhost:8003/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('File uploaded successfully:', response.data);
      setGeneratedCode(response.data.generatedCode);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Code copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="app-container dark-theme">
      <header className="app-header">
        <h1 className="site-title">PlumAI</h1>
      </header>
      <main className="main-content">
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="imageInput" className="form-label">Upload Image</label>
            <input 
              type="file" 
              id="imageInput" 
              name="imageInput" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="file-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="frameworkSelect" className="form-label">Select Framework</label>
            <select 
              id="frameworkSelect" 
              value={selectedOption} 
              onChange={handleOptionChange}
              className="select-input"
            >
              <option value="">--Please choose an option--</option>
              <option value="reactjs">React JS</option>
              <option value="nextjs">Next JS</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="cssTypeSelect" className="form-label">Select CSS Type</label>
            <select 
              id="cssTypeSelect" 
              value={cssType} 
              onChange={handleCssTypeChange}
              className="select-input"
            >
              <option value="">--Please choose an option--</option>
              <option value="tailwindcss">Tailwind CSS</option>
              <option value="customcss">Custom CSS Classes</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="additionalInput" className="form-label">Additional Input</label>
            <textarea 
              id="additionalInput" 
              value={additionalInput} 
              onChange={handleAdditionalInputChange}
              className="textarea-input"
              rows="5"
              placeholder="Enter any additional instructions or requirements..."
            />
          </div>
          <button type="submit" className="submit-button">Generate Code</button>
        </form>

        {generatedCode.jsx && (
          <div className="code-section">
            <h2 className="code-title">Generated JSX Code</h2>
            <pre className="code-display">
              <code>{generatedCode.jsx}</code>
            </pre>
            <button onClick={() => copyToClipboard(generatedCode.jsx)} className="copy-button">
              Copy JSX
            </button>
          </div>
        )}

        {generatedCode.css && (
          <div className="code-section">
            <h2 className="code-title">Generated CSS Code</h2>
            <pre className="code-display">
              <code>{generatedCode.css}</code>
            </pre>
            <button onClick={() => copyToClipboard(generatedCode.css)} className="copy-button">
              Copy CSS
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;