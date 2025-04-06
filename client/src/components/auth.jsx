import "../styles/auth.css";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const reference = useRef([]);
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      newCode[index] = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = newCode[index][i] || "";
      }
      setCode(newCode);
      const ultimoIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = ultimoIndex < 5 ? ultimoIndex + 1 : 5;
      reference.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        reference.current[index + 1].focus();
      }
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

    if (key === "ArrowRight" && index < 5) {
      reference.current[index + 1]?.focus();
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Verifique o seu email</h2>
      <p>Intruduza o código que recebeu no email</p>
      <form className="auth-form">
        <div className="form-group">
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
      </form>
    </div>
  );
}

export default Auth;
