import { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Slides.css";

function Slides() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <div className="left-panel pb-5 p-4 flex-column h-100 w-50">
      <div className="logo mb-5">
        <img src="/images/Logo.svg" alt="Logo" />
      </div>

      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        interval={5000}
        indicators={false}
        controls={false}
        className="d-flex flex-column flex-grow-1"
      >
        <Carousel.Item>
          <div className="illustration-container d-flex justify-content-center align-items-center">
            <img
              className="d-block img-fluid illustration-img"
              src="/images/undraw_post.svg"
              alt="First slide"
            />
          </div>
          <Carousel.Caption className="position-static text-dark">
            <p className="fw-normal fs-5">
              Interaja com a comunidade acerca de uma vasta gama de tópicos
            </p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <div className="illustration-container d-flex justify-content-center align-items-center">
            <img
              className="d-block img-fluid illustration-img"
              src="/images/undraw_learning.svg"
              alt="Second slide"
            />
          </div>
          <Carousel.Caption className="position-static text-dark">
            <p className=" fw-normal fs-5">
              Aprenda de forma interativa e visual! A nossa plataforma combina
              tecnologia moderna com um ensino envolvente para que progrida ao
              seu ritmo
            </p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <div className="illustration-container d-flex justify-content-center align-items-center">
            <img
              className="d-block img-fluid illustration-img"
              src="/images/undraw_certificate.svg"
              alt="Third slide"
            />
          </div>
          <Carousel.Caption className="position-static text-dark">
            <p className=" fw-normal fs-5">
              Receba certificados de conclusão para cada curso que terminar com
              sucesso
            </p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      <div className="custom-indicators d-flex justify-content-center">
        {[0, 1, 2].map((slideIndex) => (
          <button
            key={slideIndex}
            className={`indicator-dot ${index === slideIndex ? "active" : ""}`}
            onClick={() => setIndex(slideIndex)}
            aria-label={`Slide ${slideIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default Slides;
