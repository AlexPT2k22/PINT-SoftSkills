import "../App.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Divider from "./Divider.jsx";

function Login() {
  const [Login, setLogin] = useState(1); // 0 para Sign Up e 1 para Log In e 2 para Reset Password
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    if (storedEmail && storedPassword) {
      setEmail(storedEmail);
      setPassword(storedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que a página recarregue

    let url = "http://localhost:8080/";
    let method = "POST";
    let body = {};

    if (rememberMe) {
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
    } else {
      localStorage.removeItem("email");
      localStorage.removeItem("password");
    }

    if (Login === 0) {
      // Sign Up logic
      //console.log("Sign Up:", { username, email, password });
      body = {
        Username: username,
        Email: email,
        Password: password,
        LinkedIN: "NULL",
        Type: "user",
      };
      url += "user/register";
    }
    if (Login === 1) {
      // Log In logic
      //console.log("Log In:", { email, password });
      body = {
        Email: email,
        Password: password,
      };
      url += "user/login";
    }
    if (Login === 2) {
      // Reset Password logic
      console.log("Reset Password:", { email });
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (response.status === 200) {
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const changeToLogin = () => {
    setLogin(Login === 2 ? 1 : Login ^ 1);
  };

  const changeToReset = () => {
    setLogin(2);
  };

  return (
    <>
      <div className="right-panel">
        {Login !== 2 && (
          <>
            <div className="avatar">
              <div className="avatar-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="41"
                  height="41"
                  viewBox="0 0 41 41"
                  fill="none"
                >
                  <g clip-path="url(#clip0_4_249)">
                    <path
                      d="M20.5 20.4999C22.5273 20.4999 24.509 19.8987 26.1946 18.7724C27.8802 17.6462 29.194 16.0453 29.9698 14.1724C30.7456 12.2994 30.9485 10.2385 30.5531 8.25021C30.1576 6.2619 29.1813 4.43553 27.7478 3.00204C26.3144 1.56855 24.488 0.592332 22.4997 0.196833C20.5114 -0.198665 18.4504 0.00431911 16.5775 0.780117C14.7046 1.55592 13.1037 2.86968 11.9774 4.55529C10.8512 6.24089 10.25 8.22262 10.25 10.2499C10.2527 12.9675 11.3335 15.5731 13.2552 17.4947C15.1768 19.4164 17.7824 20.4972 20.5 20.4999ZM20.5 3.41655C21.8515 3.41655 23.1727 3.81732 24.2964 4.56817C25.4201 5.31903 26.296 6.38625 26.8132 7.63488C27.3304 8.88351 27.4657 10.2575 27.202 11.583C26.9384 12.9085 26.2876 14.1261 25.3319 15.0818C24.3762 16.0374 23.1587 16.6882 21.8331 16.9519C20.5076 17.2156 19.1336 17.0803 17.885 16.5631C16.6364 16.0459 15.5691 15.17 14.8183 14.0463C14.0674 12.9225 13.6667 11.6014 13.6667 10.2499C13.6667 8.43757 14.3866 6.69948 15.6681 5.41799C16.9496 4.13649 18.6877 3.41655 20.5 3.41655V3.41655Z"
                      fill="#F8F8F8"
                    />
                    <path
                      d="M20.5 23.9177C16.4237 23.9222 12.5156 25.5436 9.63323 28.426C6.75084 31.3083 5.12952 35.2164 5.125 39.2927C5.125 39.7458 5.30498 40.1803 5.62536 40.5007C5.94573 40.8211 6.38026 41.0011 6.83333 41.0011C7.28641 41.0011 7.72093 40.8211 8.04131 40.5007C8.36168 40.1803 8.54167 39.7458 8.54167 39.2927C8.54167 36.1212 9.80156 33.0795 12.0442 30.8369C14.2868 28.5943 17.3285 27.3344 20.5 27.3344C23.6715 27.3344 26.7132 28.5943 28.9558 30.8369C31.1984 33.0795 32.4583 36.1212 32.4583 39.2927C32.4583 39.7458 32.6383 40.1803 32.9587 40.5007C33.2791 40.8211 33.7136 41.0011 34.1667 41.0011C34.6197 41.0011 35.0543 40.8211 35.3746 40.5007C35.695 40.1803 35.875 39.7458 35.875 39.2927C35.8705 35.2164 34.2492 31.3083 31.3668 28.426C28.4844 25.5436 24.5763 23.9222 20.5 23.9177V23.9177Z"
                      fill="#F8F8F8"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_4_249">
                      <rect width="41" height="41" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
            <h2 className="welcome-text">Bem-Vindo!</h2>
          </>
        )}
        {Login === 2 && (
          <>
            <div className="reset-title-div">
              <h2 className="reset-title">Reset password?</h2>
              <i class="fi fi-ss-key"></i>
            </div>
            <p className="reset-desc">
              Introduza o e-mail associado à sua conta para receber <br></br> um
              link para repor a password
            </p>
          </>
        )}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            {Login === 0 && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {Login !== 2 && (
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          {Login === 1 && (
            <div className="form-extra">
              <div className="checkbox-itens">
                <input
                  className="checkbox"
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label className="checkbox-text" htmlFor="remember-me">
                  Guardar log-in
                </label>
              </div>
              <a onClick={changeToReset}>Reset password</a>
            </div>
          )}
          {Login === 0 && (
            <>
              <button type="submit" className="signup-button">
                Criar conta
              </button>
              <Divider text="Ou registe-se com"/>
              <div className="enter-with">
                <button className="enter-with-button" type="button">
                  <img src="./images/linkedin.svg" alt="linkedin"></img>
                </button>
              </div>
            </>
          )}
          {Login === 1 && (
            <>
              <button type="submit" className="login-button">
                Entrar
              </button>
              <Divider text="Ou entre com"/>
              <div className="enter-with">
                <button className="enter-with-button" type="button">
                  <img src="./images/linkedin.svg" alt="linkedin"></img>
                </button>
              </div>
            </>
          )}
          {Login === 2 && (
            <>
              <div className="form-group-buttons-reset">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={changeToLogin}
                >
                  Cancelar
                </button>
                <button type="button" className="login-button">
                  Reset password
                </button>
              </div>
            </>
          )}
        </form>

        <div className="login-link">
          {Login === 0 && (
            <p>
              Já tem conta? <a onClick={changeToLogin}>Entrar</a>
            </p>
          )}
          {Login === 1 && (
            <p>
              Não tem conta? <a onClick={changeToLogin}>Criar conta</a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Login;
