import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  isSKAdded,
  setOpenAiApiKey,
} from "../../utils/localStorage";

const UpdateAPIKey = ({ setShowUpdateApiKey }) => {
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState(
    "Please Enter your API Key to continue."
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading && apiKey.trim()) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Please wait updating API KEY");
    setIsLoading(true);

    try {
      await setOpenAiApiKey(apiKey);
      if (isSKAdded()) {
        setMessage("API key updated successfully!");
        setApiKey("");
        setShowUpdateApiKey(false);
      }
      // const response = await axios.put(`${apiUrl}/users/update-openapikey`, {
      //   email: userEmail,
      //   openAiApiKey: apiKey,
      // });

      // if (response.status === 200) {
      //   setMessage("API key updated successfully!");
      //   setApiKey("");
      //   setShowUpdateApiKey(false);
      //   setIsSKAdded();
      // }
    } catch (error) {
      if (error.message == "INVALID_KEY") {
        setMessage("Error: Invalid API key please try again.");
      } else {
        setMessage("Error updating API key. Please try again.");
      }
      console.error("Error updating API key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-content">
      <div className="messages-container">
        {message && (
          <div
            className={`message ${
              message.includes("Error") ? "error-message" : "assistant-message"
            }`}
          >
            {message}
          </div>
        )}
      </div>
      <div className="input-wrapper">
        <input
          type="text"
          className="modal-input"
          value={apiKey}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Updating API Key..." : "Enter your API Key"}
        />
        <button
          className="modal-send-btn"
          onClick={handleSubmit}
          disabled={isLoading || !apiKey.trim()}
        >
          <FontAwesomeIcon
            icon={isLoading ? faSpinner : faPaperPlane}
            spin={isLoading}
          />
        </button>
      </div>
    </div>
  );
};

export default UpdateAPIKey;
