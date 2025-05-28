import React from "react";
import { useEffect } from "react";

function ErrorMessage({ message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className="alert alert-danger alert-dismissible fade show position-fixed d-flex align-items-center"
      role="alert"
      style={{
        zIndex: 9999,
        top: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        minWidth: "300px",
        maxWidth: "80%",
      }}
    >
      {message}
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
        onClick={onClose}
      ></button>
    </div>
  );
}

export default ErrorMessage;
