import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import axios from "axios";
import ButtonWithLoader from "./butao_loader.jsx";
import SuccessMessage from "./sucess_message.jsx";
import ErrorMessage from "./error_message.jsx";
import "../styles/resetpassword.css";

function ChangeInitialPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const user = useAuthStore((state) => state.user);
  const userType = useAuthStore((state) => state.userType);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("As passwords não coincidem.");
      return;
    }

    if (password.length < 6) {
      setMessage("A password deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const url = import.meta.env.VITE_API_URL || "http://localhost:4000";

      const response = await axios.post(
        `${url}/api/auth/change-initial-password`,
        { PASSWORD: password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setShowSuccess(true);
      }

      // Após 2 segundos, redirecionar
      setTimeout(() => {
        if (userType === 2 || userType === 3) {
          navigate("/role");
        } else {
          navigate("/login?login=1");
        }
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || "Erro ao alterar a password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center w-50">
      <div className="reset-container d-flex flex-column justify-content-center align-items-center">
        {showSuccess && (
          <SuccessMessage
            message="Password alterada com sucesso!"
            onClose={() => setShowSuccess(false)}
          />
        )}
        {message && (
          <ErrorMessage message={message} onClose={() => setMessage("")} />
        )}

        <h2 className="text-center mb-3">Altere a sua password</h2>
        <p className="text-center text-muted mb-4">
          No primeiro acesso, é necessário alterar a password para maior
          segurança
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
          />
          <input
            className="reset-password-input mb-3"
            type="password"
            placeholder="Confirme nova password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="buttons-reset gap-3 d-flex justify-content-center align-items-center">
            <button type="submit" className="btn btn-primary login-button">
              {isLoading ? (
                <ButtonWithLoader isLoading={isLoading} />
              ) : (
                "Alterar password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeInitialPassword;
