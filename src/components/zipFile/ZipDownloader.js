import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const ZipDownloader = ({ html, css, js }) => {
  const handleDownload = async () => {
    const zip = new JSZip();

    // Add files to the zip
    zip.file("index.html", html);
    zip.file("style.css", css);
    zip.file("script.js", js);

    // Generate the zip file
    const content = await zip.generateAsync({ type: "blob" });

    // Trigger the download
    saveAs(content, "web-project.zip");
  };

  return (
    <div style={styles.container}>
      <button 
        onClick={handleDownload}
        style={styles.button}
        title="Download as ZIP"
      >
        <div style={styles.iconContainer}>
          <FontAwesomeIcon icon={faDownload} style={styles.icon} />
        </div>
      </button>
    </div>
  );
};

const styles = {
  container: {
    // You can add any container styles here if needed
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

export default ZipDownloader;