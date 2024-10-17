import React, { useCallback, useEffect, useRef, useState } from "react";
import Loader from "../loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getRandomLoadingMessage } from "../../utils/utils";
// import { getRandomLoadingMessage } from "../../utils";

const ChatBox = ({ messages, isLoading, onSend,setShowUpdateApiKey }) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);


  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading && inputValue.trim()) {
      e.preventDefault();
      handleSend();
    }
  };



  const handleSend = useCallback(() => {
    console.log("handleSend called");
    if (onSend && inputValue.trim()) {
      console.log("inside handle send chatbox------>", inputValue);
      
      onSend(setInputValue,inputValue,setShowUpdateApiKey);
      setInputValue(""); // Clear the input field
    } else {
      console.log("onSend not called. onSend:", !!onSend, "inputValue:", inputValue);
    }
  }, [onSend, inputValue]);

  const parseGPTResponse = (inputString) => {
    const match = inputString.match(/response:\s*(.+)}/);
    return match && match[1] ? match[1].replace(/`$/, "").trim() : "GPT response not found in the input string.";
  };

  return (
    <div className="modal-content">
      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.role === "user"
                ? "user-message"
                : message.role === "assistant"
                ? "assistant-message"
                : "error-message"
            }`}
          >
            {message.role === "assistant"
              ? parseGPTResponse(message.content)
              : message.content}
          </div>
        ))}
        <div ref={messagesEndRef}/>
        {isLoading && <Loader />}
      </div>

      <div className="input-wrapper">
        <input
          type="text"
          className="modal-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isLoading ? getRandomLoadingMessage() : "type your prompt here.."
          }
        />
        <button
          className="modal-send-btn"
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
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

export default ChatBox;