import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Modal.css";
import ChatBox from "./ChatBox.js"; // Import the new component
import GoogleAuth from "./GoogleAuth.js";
import UpdateAPIKey from "./UpdateAPIKey.js";
import {
  isLoggedIn,
  isSKAdded,
} from "../../utils/localStorage.js";

function Modal({ title, onClose, onSend, isLoading, messages }) {
  const modalRef = useRef(null);
  // const messagesEndRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [modalPosition, setModalPosition] = useState(null);
  const [showUpdateApiKey, setShowUpdateApiKey] = useState(
     !isSKAdded()
  );

  const centerModal = useCallback(() => {
    if (modalRef.current) {
      const { width, height } = modalRef.current.getBoundingClientRect();
      const centerX = window.innerWidth / 2 - width / 2;
      const centerY = window.innerHeight / 2 - height / 2;
      setModalPosition({ top: centerY, left: centerX });
    }
  }, []);

  useEffect(() => {
    centerModal();
    window.addEventListener("resize", centerModal);
    return () => window.removeEventListener("resize", centerModal);
  }, [centerModal]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      setModalPosition((prev) => ({
        top: e.clientY - offset.y,
        left: e.clientX - offset.x,
      }));
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset]);

  const handleMouseDown = useCallback((e) => {
    const { left, top } = modalRef.current.getBoundingClientRect();
    setIsDragging(true);
    setOffset({
      x: e.clientX - left,
      y: e.clientY - top,
    });
  }, []);

  const modalStyle = {
    top: modalPosition ? `${modalPosition.top}px` : "50%",
    left: modalPosition ? `${modalPosition.left}px` : "50%",
    transform: modalPosition ? "none" : "translate(-50%, -50%)",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        ref={modalRef}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" onMouseDown={handleMouseDown}>
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {
            !isSKAdded() ? (
              <UpdateAPIKey setShowUpdateApiKey={setShowUpdateApiKey} />
            ) : (
              <ChatBox
                messages={messages}
                isLoading={isLoading}
                onSend={onSend} // Pass the send function only
                setShowUpdateApiKey={setShowUpdateApiKey}
              />
            
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Modal);
