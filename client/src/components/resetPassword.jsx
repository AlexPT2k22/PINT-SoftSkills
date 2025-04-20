import React from "react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import ButtonWithLoader from "./butao_loader.jsx";

function ResetPassword() {
  const reference = useRef([]);
  const navigate = useNavigate();
  const { error, isLoading } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);
  return (
    <>
      <div className="container d-flex justify-content-center align-items-center w-50">
        <div className="reset-container">
          {showSuccess && (
            <div
              className="alert alert-success fade show position-absolute d-flex align-items-center sucess-alert-message"
              role="alert"
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
              Password alterada com sucesso! A redirecionar...
            </div>
          )}
          {error && (
            <div
              className="alert alert-danger fade show position-absolute d-flex align-items-center sucess-alert-message"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>

        <div className="container d-flex flex-column justify-content-center align-items-center">
          <h2 className="text-center mb-3">Alterar a password</h2>
          <p className="text-center text-muted mb-4 code-text">
            Introduza a sua nova password
          </p>
          <form>
            <input
              className="reset-password-input"
              type="password"
              placeholder="Nova password"
              required
            ></input>
            <div className="form-group-buttons-reset">
              <button
                type="button"
                className="btn btn-secondary cancel-button"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary login-button">
                {isLoading ? (
                  <ButtonWithLoader isLoading={isLoading} />
                ) : (
                  "Resetar password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
