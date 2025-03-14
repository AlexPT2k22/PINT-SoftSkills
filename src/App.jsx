import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [timer, setTimer] = useState(null);

  // Add a useEffect hook
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide + 1) % 3); // 3 is the number of slides
    }, 5000); // 5000 is the duration in milliseconds

    setTimer(interval); // Save the interval to the state

    return () => clearInterval(interval); // Clear the interval when the component unmounts
  }, []);

  const handleDotClick = (index) => {
    clearInterval(timer); // Clear the interval when a dot is clicked
    setActiveSlide(index);

    const newInterval = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide + 1) % 3);
    }, 5000);
    
    setTimer(newInterval);
  };

  return (
    <div className="login-container">
      {/* Left side with illustration and company info */}
      <div className="left-panel">
        <div className="logo">
          <img src="/images/Logo.svg"></img>
        </div>

        <div className="illustration">
          {activeSlide === 0 && <img src="/images/undraw_post.svg" />}
          {activeSlide === 1 && <img src="/images/undraw_learning.svg" />}
          {activeSlide === 2 && <img src="/images/undraw_certificate.svg" />}
        </div>

        <div className="slide-content">
          {activeSlide === 0 && (
            <p className="active-text">
              Interaja com a comunidade acerca de uma vasta gama de tópicos
            </p>
          )}
          {activeSlide === 1 && (
            <p className="active-text">
              Aprenda de forma interativa e visual! A nossa plataforma combina
              tecnologia moderna com um ensino envolvente para que progrida ao
              seu ritmo
            </p>
          )}
          {activeSlide === 2 && (
            <p className="active-text">
              Receba certificados de conclusão para cada curso que terminar com
              sucesso
            </p>
          )}
        </div>

        <div className="dots">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`dot ${activeSlide === index ? "active" : ""}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>

      {/* Right side with login form */}
      <div className="right-panel">
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

        <h2>Bem-Vindo!</h2>

        <form className="login-form">
          <div className="form-group">
            <input type="text" placeholder="Username" />
          </div>
          <div className="form-group">
            <input type="email" placeholder="Email" />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Password" />
          </div>
          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>

        <div className="login-link">
          <p>
            Já tem conta? <a href="#">Log In</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
