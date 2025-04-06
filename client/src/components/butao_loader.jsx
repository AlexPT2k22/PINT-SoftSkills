import React from "react";
import "../styles/butao_loader.css";

function ButtonWithLoader({ isLoading, onClick, children }) {
  return (
    <div className="btn-with-loader" onClick={onClick} disabled={isLoading}>
      {isLoading ? <div className="spinner"></div> : children}
    </div>
  );
}

export default ButtonWithLoader;
