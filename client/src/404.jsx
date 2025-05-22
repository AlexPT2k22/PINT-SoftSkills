import React from "react";
import Navbar from "./components/navbar";

function NotFound() {
  return (
    <div className="container-fluid p-0">
      <Navbar />
      <div
        className="container d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "80vh" }}
      >
        <h1 className="display-1 fw-bold text-secondary">404</h1>
        <h2 className="h3 mb-4 text-muted">Oops! Página não encontrada</h2>

        <div className="mb-4">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="#f3f4f6"
              stroke="#d1d5db"
              strokeWidth="2"
            />
            <path
              d="M65 125C75 105 125 105 135 125"
              stroke="#6b7280"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="75" cy="75" r="8" fill="#6b7280" />
            <circle cx="125" cy="75" r="8" fill="#6b7280" />
          </svg>
        </div>

        <p className="text-muted text-center mb-4 w-75">
          Esta página não existe ou foi removida.
        </p>

        <button
          onClick={() => (window.location.href = "/")}
          className="btn btn-primary"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

export default NotFound;
