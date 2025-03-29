import { useState, useEffect } from "react";
import "../App.css";

function Slides() {
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
    setTimer(newInterval);
  };

  return (
    <>
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
    </>
  );
}

export default Slides;
