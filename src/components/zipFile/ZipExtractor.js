import React, { useRef } from 'react';
import JSZip from 'jszip';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileUpload } from "@fortawesome/free-solid-svg-icons";

const ZipExtractor = ({ onZipExtracted }) => {
  const fileInputRef = useRef(null);

  const isEncodedString = (content) => {
    // Check for common patterns in encoded strings
    const encodedPatterns = [
      /Mac OS X.*ATTR/,
      /com\.apple\.quarantine/,
      /[^\x20-\x7E]{4,}/, // Look for 4 or more non-printable ASCII characters in a row
    ];

    return encodedPatterns.some(pattern => pattern.test(content));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    let html = "";
    let css = "";
    let js = "";

    if (file) {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);

      for (const [filename, fileData] of Object.entries(contents.files)) {
        if (!fileData.dir) {
          const content = await fileData.async('string');
          if (!isEncodedString(content)) {
            if (filename.endsWith('.html')) {
              html = content;
            } else if (filename.endsWith('.css')) {
              css = content;
            } else if (filename.endsWith('.js')) {
              js = content;
            }
          }
        }
      }
      onZipExtracted(html, css, js);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={styles.container}>
      <input
        type="file"
        ref={fileInputRef}
        accept=".zip"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <button onClick={handleButtonClick} style={styles.button}>
        <div style={styles.iconContainer}>
          <FontAwesomeIcon icon={faFileUpload} style={styles.icon} />
        </div>
      </button>
    </div>
  );
};

const styles = {
  container: {
    // padding: '16px',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  iconContainer: {
    backgroundColor: 'rgba(226, 227, 227, 0.2);',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
    fontSize: '18px',
  },
};

export default ZipExtractor;