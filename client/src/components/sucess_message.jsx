import React from "react";
import { useEffect } from "react";

function SuccessMessage({ message, onClose, duration = 4000 }) {
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
    <>
      <div
        className="alert alert-success alert-dismissible fade show position-fixed d-flex align-items-center"
        role="alert"
        style={{
          zIndex: 9999,
          top: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          minWidth: "350px",
          maxWidth: "100%",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="bi flex-shrink-0 me-2"
        >
          <path
            fill="#198754"
            d="M8,0C3.582,0,0,3.582,0,8s3.582,8,8,8s8-3.582,8-8S12.418,0,8,0z M7,12L3.48,8.48l1.414-1.414L7,9.172l4.71-4.71	l1.414,1.414L7,12z"
          ></path>
        </svg>
        {message}
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
    </>
  );
}

export default SuccessMessage;
