import React, { useState } from "react";
import axios from "axios";
import {  setOpenAiApiKey } from "../../utils/localStorage";
const apiUrl = process.env.REACT_APP_API_URL;

const UpdateApiKeyModal = ({ onClose }) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdateApiKey = async () => {
    setIsLoading(true);
    setError("");
    // const userEmail = getUserDetails().email;
    try {
      await setOpenAiApiKey(apiKey);
      // console.log("API Key updated successfully", response.data);
      onClose();
    } catch (error) {
      console.error("Error updating API Key", error.message);
      if (error.message == "INVALID_KEY") {
        setError("Invalid API KEY.");
      } else {
        setError("Failed to update API Key. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Update API Key</h2>
          <button style={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>
        <div style={styles.modalBody}>
          <input
            type="text"
            style={styles.apiKeyInput}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API Key"
          />
          {error && <p style={styles.errorMessage}>{error}</p>}
          <button
            style={
              isLoading
                ? { ...styles.updateButton, ...styles.updateButtonDisabled }
                : styles.updateButton
            }
            onClick={handleUpdateApiKey}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
    padding: "20px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.5rem",
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
  },
  apiKeyInput: {
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  },
  updateButton: {
    padding: "8px",
    backgroundColor: "#5aa5f5",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    cursor: "pointer",
  },
  updateButtonDisabled: {
    backgroundColor: "#cccccc",
    cursor: "not-allowed",
  },
  errorMessage: {
    color: "red",
    marginBottom: "10px",
  },
};

export default UpdateApiKeyModal;
