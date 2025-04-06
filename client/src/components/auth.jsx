import "../styles/auth.css";
import { useState, useRef, use } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import ErrorMessage from "./error_message.jsx";
import ButtonWithLoader from "./butao_loader.jsx";

function Auth() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const reference = useRef([]);
  const navigate = useNavigate();
  const { error, isLoading, verify_email } = useAuthStore();

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // só permite dígitos de 0-9

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < code.length - 1) {
      reference.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    const { key } = e;

    if (key === "Backspace") {
      if (code[index] === "") {
        if (index > 0) {
          reference.current[index - 1]?.focus();
        }
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }

    if (key === "ArrowLeft" && index > 0) {
      reference.current[index - 1]?.focus();
    }

    if (key === "ArrowRight" && index < code.length - 1) {
      reference.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const codVerification = code.join("");
    console.log(`Código enviado: ${codVerification}`);
    try {
      await verify_email(codVerification);
      navigate("/login");
    } catch (error) {
      console.log(error.response.data.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-border">
        <h2>Verifique a sua conta</h2>
        <p className="code-text">Intruduza o código que recebeu no email</p>
        <form className="auth-form">
          <div className="auth-form-group">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                ref={(el) => (reference.current[index] = el)}
                value={digit}
                max={6}
                onChange={(e) => {
                  handleChange(index, e.target.value);
                }}
                onKeyDown={(e) => {
                  handleKeyDown(index, e);
                }}
                className="auth-input"
              />
            ))}
          </div>
          <p className="auth-text">
            Não recebeu o código?
            <a className="auth-resend-text">Reenviar código</a>
          </p>
          {error && <ErrorMessage message={error} />}
          <button className="auth-button" onClick={handleSubmit}>
            {isLoading ? (
              <ButtonWithLoader isLoading={isLoading} />
            ) : (
              "Verificar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;
