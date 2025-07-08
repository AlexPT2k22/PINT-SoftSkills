import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import ErrorMessage from "./error_message.jsx";
import SuccessMessage from "./sucess_message.jsx";
import ButtonWithLoader from "./butao_loader.jsx";
import "../styles/auth.css";
import axios from "axios";

function Auth() {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const reference = useRef([]);
  const navigate = useNavigate();
  const { error, isLoading, verify_email, user } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 500); // redireciona após 0.5 segundos
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  useEffect(() => {
    if (user?.isVerified) {
      if (user.perfil === 2 || user.perfil === 3) {
        navigate("/role");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);
  useEffect(() => {
    if (resendSuccess) {
      const timer = setTimeout(() => {
        setResendSuccess(false);
      }, 500); // Mostra a mensagem por 5 segundos
      return () => clearTimeout(timer);
    }
  }, [resendSuccess]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < code.length - 1) {
      reference.current[index + 1]?.focus();
    }
  };

  const handleResendCode = async (email) => {
    console.log(`A reenviar código para ${email}`);
    setMessage("");
    setResendSuccess(false);
    try {
      const response = await axios.post(
        `${URL}/api/auth/resend-verification-code`,
        { email }
      );

      if (response.status === 200) {
        //console.log("Código reenviado com sucesso");
        setMessage("Código reenviado com sucesso!");
        setResendSuccess(true);
      }
    } catch (error) {
      console.error("Erro ao reenviar código:", error);
      setMessage("Erro ao reenviar código. Tente novamente.");
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

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("").slice(0, code.length);
      const newCode = [...code];

      digits.forEach((digit, index) => {
        if (index < code.length) newCode[index] = digit;
      });

      setCode(newCode);

      const nextEmptyIndex = newCode.findIndex((d) => d === "");
      if (nextEmptyIndex !== -1) {
        reference.current[nextEmptyIndex]?.focus();
      } else {
        reference.current[code.length - 1]?.focus();
        if (newCode.every((digit) => digit !== "")) {
          setTimeout(() => {
            const form = reference.current[0]?.form;
            if (form)
              form.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
          }, 100);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const codVerification = code.join("");
    //console.log(`Código enviado: ${codVerification}`);
    try {
      await verify_email(codVerification);
      setMessage("Email verificado com sucesso!");
      setShowSuccess(true);
    } catch (error) {
      console.log(error.response?.data?.error);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center auth-page-container w-50">
      <div className="auth-container">
        {showSuccess && (
          <SuccessMessage
            message={message}
            onClose={() => setShowSuccess(false)}
          />
        )}
        {resendSuccess && (
          <SuccessMessage
            message={message}
            onClose={() => setResendSuccess(false)}
          />
        )}
        {error && (
          <ErrorMessage
            message={error}
            onClose={() => useAuthStore.setState({ error: null })}
          />
        )}
        <h2 className="text-center mb-3">Verifique a sua conta</h2>
        <p className="text-center text-muted mb-4 code-text">
          Introduza o código que recebeu no email
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="d-flex justify-content-center gap-2 mb-3 auth-form-group">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                ref={(el) => (reference.current[index] = el)}
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="form-control text-center fs-4 auth-input"
              />
            ))}
          </div>
          <div className="text-center mb-4 d-flex justify-content-center align-items-center auth-text">
            <span className="text-muted p-0">Não recebeu o código?</span>
            <span
              className="btn btn-link p-0 ms-1 text-decoration-none auth-resend-text"
              onClick={() => handleResendCode(email)}
            >
              Reenviar código
            </span>
          </div>
          <button type="submit" className="btn btn-primary w-100 auth-button">
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
