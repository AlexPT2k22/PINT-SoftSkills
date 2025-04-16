import React from "react";
import { useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";
import Navbar from "./components/navbar";
import Loader from "./components/loader.jsx";
import useAuthStore from "./store/authStore.js";

function CouseCatalogue() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <>
      <Navbar />
      <div className="course-catalogue-container">
        <h1 className="text-center mb-4">Course Catalogue</h1>
        <Carousel
          interval={5000}
          indicators={true}
          controls={true}
          touch={true}
        >
          <Carousel.Item>
            <div>
              <img
                src="https://placehold.co/600x400"
                className="d-block"
              />
              <Carousel.Caption
                className="text-start"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: "3rem 2rem",
                }}
              >
                <h3 className="fs-2 fw-bold mb-2">TITULO</h3>
                <p className="fs-6">DESCRICAO</p>
              </Carousel.Caption>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <div>
              <img
                className="d-block"
              />
              <Carousel.Caption
                className="text-start"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: "3rem 2rem",
                }}
              >
                <h3 className="fs-2 fw-bold mb-2">TITULO2</h3>
                <p className="fs-6">DESCRICAO2</p>
              </Carousel.Caption>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <div>
              <img
                className="d-block"
              />
              <Carousel.Caption
                className="text-start"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: "3rem 2rem",
                }}
              >
                <h3 className="fs-2 fw-bold mb-2">TITULO3</h3>
                <p className="fs-6">DESCRICAO3</p>
              </Carousel.Caption>
            </div>
          </Carousel.Item>
        </Carousel>
      </div>
    </>
  );
}

export default CouseCatalogue;
