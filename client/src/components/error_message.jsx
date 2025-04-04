import React from "react";

const ErrorMessage = ({ message }) => {
  return (
    <div
      style={{
        color: "red",
        fontSize: "14px",
        marginTop: "0.4rem",
        fontFamily: "'Roboto', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
