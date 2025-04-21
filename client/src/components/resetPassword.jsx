import React from "react";
import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import ButtonWithLoader from "./butao_loader.jsx";
import "../styles/resetpassword.css";
import SuccessMessage from "./sucess_message.jsx";
import ErrorMessage from "./error_message.jsx";

function ResetPassword() {
  const reference = useRef([]);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const { error, isLoading, resetPassword } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("As passwords não coincidem.");
      return;
    }
    try {
      await resetPassword(token, password);
      setShowSuccess(true);
    } catch (error) {
      console.error("Erro ao redefinir a password:", error);
    }
  };

  console.log(token);

  return (
    <>
      <div className="d-flex justify-content-center align-items-center w-50">
        <div className="reset-container d-flex flex-column justify-content-center align-items-center">
          {showSuccess && (
            <SuccessMessage
              message="Password alterada com sucesso. Você será redirecionado para a página de login."
              onClose={() => setShowSuccess(false)}
            />
          )}
          {error && (
            <ErrorMessage
              message={error}
              onClose={() => useAuthStore.setState({ error: null })}
            />
          )}
          {message && (
            <ErrorMessage
              message={message}
              onClose={() => useAuthStore.setState({ error: null })}
            />
          )}

          <h2 className="text-center mb-3">Alterar a password</h2>
          <p className="text-center text-muted mb-4 code-text">
            Introduza a sua nova password
          </p>
          <form
            onSubmit={handleSubmit}
            className="d-flex flex-column align-items-center"
          >
            <input
              className="reset-password-input mb-3"
              type="password"
              placeholder="Nova password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <input
              className="reset-password-input mb-3"
              type="password"
              placeholder="Confirme nova password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></input>
            <div className="buttons-reset gap-3 d-flex justify-content-center align-items-center">
              <button
                type="button"
                className="btn btn-secondary cancel-button"
                onClick={() => navigate("/login")}
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
