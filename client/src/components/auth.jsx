import "../styles/auth.css";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const reference = useRef([]);
  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const codVerification = code.join("");
    console.log(codVerification);
  };

  return (
    <div className="auth-container">
      <div className="auth-border">
        <h2>Verifique o seu email</h2>
        <p>Intruduza o código que recebeu no email</p>
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
          <button className="auth-button" onClick={handleSubmit}>
            Verificar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;
