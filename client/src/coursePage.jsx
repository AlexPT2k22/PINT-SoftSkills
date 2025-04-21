import React from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import { Star } from "lucide-react";
import Divider from "./components/Divider.jsx";

function CoursePage() {
  return (
    <>
      <Navbar />
      <div
        className="container-fluid banner-curso"
        style={{ height: "60vh", backgroundColor: "#D6DEE880" }} // passar para css TODO:
      >
        <div className="container d-flex flex-column justify-content-start">
          <div className="container d-flex justify-content-start mt-3">
            <nav aria-label="breadcrumb mt-2">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <a href="#" className="text-decoration-none">
                    CATEGORIA
                  </a>
                </li>
                <li class="breadcrumb-item">
                  <a href="#" className="text-decoration-none">
                    AREA
                  </a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">
                  TOPICO
                </li>
              </ol>
            </nav>
          </div>

          <div className="container d-flex flex-row justify-content-start gap-1 p-0">
            <div className="container d-flex flex-column justify-content-start mt-4">
              <h1>Nome do Curso</h1>
              <p className="mt-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                facilisis ligula sollicitudin viverra pharetra. Ut ultricies
                sollicitudin augue sit amet ultricies. Duis euismod, tellus
                porttitor venenatis lobortis, leo lectus fermentum lacus, sed
                lobortis nisi ipsum vitae libero. Class aptent taciti sociosqu
                ad litora torquent per conubia nostra, per inceptos himenaeos.
                Cras vel turpis enim. Curabitur eget arcu vel massa suscipit
                mollis et rhoncus sem. Suspendisse venenatis nisi ac tristique
                elementum.
              </p>
              <div className="d-flex flex-row justify-content-between">
                <h1 style={{ fontSize: "1rem" }}>
                  Lecionado por: NOMEFORMADOR
                </h1>
                <h1 style={{ fontSize: "1rem" }}>X vagas restantes</h1>
              </div>
              <div className="d-flex justify-content-start mt-3">
                <button className="btn btn-primary fs-5 ps-5 pe-5">
                  Inscrever
                </button>
              </div>
            </div>

            <div className="d-flex align-itens-center justify-content-center p-3">
              <img
                src="https://placehold.co/530x300"
                alt="CursoImage"
                className="rounded"
                style={{ width: "530px", height: "300px" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="container d-flex flex-row justify-content-around p-3 shadow border"
        style={{
          borderRadius: "10px",
          margin: "-60px auto 0",
          zIndex: "1",
          position: "relative",
          backgroundColor: "#fff",
        }}
      >
        <div
          className="container d-flex flex-column align-items-center justify-content-center"
          style={{ height: "90px" }}
        >
          <h1 className="fs-5 m-0">X módulos</h1>
        </div>
        <div className="container d-flex flex-column align-items-center justify-content-center border-start">
          <h1 className="fs-5 m-0">Aprenda ao seu ritmo</h1>
          <p className="m-0 fs-6">X horas no total</p>
        </div>
        <div className="container d-flex flex-column justify-content-center align-items-center border-start">
          <div className="d-flex align-items-center flex-column">
            <div className="d-flex flex-row justify-content-center align-items-center">
              <h1 className="mb-0 fs-4">4.3</h1>
              <Star fill="#39639C" strokeWidth={0} />
            </div>
            <div className="d-flex align-items-center justify-content-center">
              <p className="m-0 fs-6 text-center">X reviews</p>
            </div>
          </div>
        </div>
        <div className="container d-flex flex-column align-items-center justify-content-center border-start">
          <h1 className="fs-5 m-0">DIFICULDADE</h1>
          <div className="d-flex align-items-center justify-content-center">
            <p className="m-0 fs-6">Nível de dificuldade</p>
          </div>
        </div>
        <div className="container d-flex flex-column align-items-center justify-content-center border-start">
          <h1 className="fs-5 m-0 text-center">Certificado disponível</h1>
          <div className="d-flex align-items-center justify-content-center">
            <p className="m-0 fs-6 text-center">
              A conclusão deste curso<br></br> garante um certificado
            </p>
          </div>
        </div>
      </div>

      <div className="container d-flex flex-column mt-5 p-0">
        <div className="container justify-content-start d-flex align-items-center">
          <ul class="list-group list-group-horizontal">
            <a
              href="#"
              class="list-group-item list-group-item-action horizontal-list-item"
              style={{
                border: "none",
                borderRadius: "0",
                borderBottom: "3px solid #00B8E0",
                backgroundColor: "rgba(0, 0, 0, 0)",
              }}
            >
              Info
            </a>
            <a
              href="#"
              class="list-group-item list-group-item-action horizontal-list-item"
              style={{
                border: "none",
                borderRadius: "0",
                backgroundColor: "rgba(0, 0, 0, 0)",
              }}
            >
              Capítulos
            </a>
            <a
              href="#"
              class="list-group-item list-group-item-action horizontal-list-item"
              style={{
                border: "none",
                borderRadius: "0",
                backgroundColor: "rgba(0, 0, 0, 0)",
              }}
            >
              Reviews
            </a>
          </ul>
        </div>
        <div className="container d-flex align-items-center p-0">
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "#DFE4EA",
              marginTop: "-2px",
            }}
          ></div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CoursePage;
