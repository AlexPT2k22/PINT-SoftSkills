import React from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import { Star } from "lucide-react";
import { Check } from "lucide-react";
import "./styles/coursePage.css";

function CoursePage() {
  const [index, setIndex] = React.useState(0); // 0 - Info, 1 - Módulos, 2 - Reviews

  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
    //console.log(newIndex);
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid banner-curso">
        <div className="container d-flex flex-column justify-content-start">
          <div className="container d-flex justify-content-start mt-3">
            <nav aria-label="breadcrumb mt-2">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="#" className="text-decoration-none">
                    CATEGORIA
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" className="text-decoration-none">
                    AREA
                  </a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
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
                <h1 className="course-text-h1">Lecionado por: NOMEFORMADOR</h1>
                <h1 className="course-text-h1">X vagas restantes</h1>
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
                className="rounded course-image"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container d-flex flex-row justify-content-around p-3 shadow border course-info-banner">
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
          <ul className="list-group list-group-horizontal">
            <a
              onClick={() => handleIndexChange(0)}
              className={`list-group-item list-group-item-action horizontal-list-item pb-0 rounded-0 course-tab ${
                index === 0 ? "active" : ""
              }`}
            >
              Info
            </a>
            <a
              onClick={() => handleIndexChange(1)}
              className={`list-group-item list-group-item-action horizontal-list-item pb-0 course-tab ${
                index === 1 ? "active" : ""
              }`}
            >
              Módulos
            </a>
            <a
              onClick={() => handleIndexChange(2)}
              className={`list-group-item list-group-item-action horizontal-list-item pb-0 rounded-0 course-tab ${
                index === 2 ? "active" : ""
              }`}
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

      <div className="container d-flex flex-column p-0 mt-2">
        {index === 0 && (
          <>
            <div className="d-flex flex-row">
              <div className="d-flex flex-column">
                <h1 className="fs-4 m-0 p-2">O que vai aprender</h1>
                <div className="d-flex flex-column">
                  <div className="row">
                    <div className="col">
                      <div className="d-flex flex-row objectives align-items-center m-3">
                        <Check
                          className="me-2"
                          size={35}
                          strokeWidth={1}
                          color="#373737"
                        />
                        <p className="m-0" style={{ maxWidth: "320px" }}>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Aenean facilisis ligula
                        </p>
                      </div>
                    </div>
                    <div className="col">
                      <div className="d-flex flex-row align-items-center objectives m-3">
                        <Check
                          className="me-2"
                          size={35}
                          strokeWidth={1}
                          color="#373737"
                        />
                        <p className="m-0" style={{ maxWidth: "320px" }}>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Aenean facilisis ligula
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <div className="d-flex flex-row align-items-center objectives m-3">
                        <Check
                          className="me-2"
                          size={35}
                          strokeWidth={1}
                          color="#373737"
                        />
                        <p className="m-0" style={{ maxWidth: "320px" }}>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Aenean facilisis ligula
                        </p>
                      </div>
                    </div>
                    <div className="col">
                      <div className="d-flex flex-row align-items-center objectives m-3">
                        <Check
                          className="me-2"
                          size={35}
                          strokeWidth={1}
                          color="#373737"
                        />
                        <p className="m-0" style={{ maxWidth: "320px" }}>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Aenean facilisis ligula
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex flex-column ps-3 border-start">
                <h1 className="fs-4 m-0 p-2">Habilidades que desenvolverá</h1>
                <div className="d-flex flex-column p-2">
                  <div className="row">
                    <div className="col">
                      <p
                        className="m-0 p-1 text-center"
                        style={{
                          backgroundColor: "#D6DEE880",
                          borderRadius: "5px",
                          fontSize: "16px",
                        }}
                      >
                        Habilidade
                      </p>
                    </div>
                    <div className="col">
                      <p
                        className="m-0 p-1 text-center"
                        style={{
                          backgroundColor: "#D6DEE880",
                          borderRadius: "5px",
                          fontSize: "16px",
                        }}
                      >
                        Habilidade
                      </p>
                    </div>
                    <div className="col">
                      <p
                        className="m-0 p-1 text-center"
                        style={{
                          backgroundColor: "#D6DEE880",
                          borderRadius: "5px",
                          fontSize: "16px",
                        }}
                      >
                        Habilidade
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {index === 1 && (
          <>
            <div className="d-flex flex-row">
              <div className="d-flex flex-column w-100">
                <h1 className="fs-4 m-0 p-2">Módulos ao longo do curso</h1>
                <div className="d-flex flex-column mt-3">
                  <div className="row row-cols-1 row-cols-md-2 g-4">
                    {/* Module 1 */}
                    <div className="col">
                      <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">Módulo 1</h5>
                          <p className="card-text flex-grow-1">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Aenean facilisis ligula sollicitudin viverra
                            pharetra. Ut ultricies sollicitudin augue sit amet
                            ultricies.
                          </p>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                Duração: Xh Ymin
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Module 2 */}
                    <div className="col">
                      <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">Módulo 2</h5>
                          <p className="card-text flex-grow-1">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Aenean facilisis ligula sollicitudin viverra
                            pharetra. Ut ultricies sollicitudin augue sit amet
                            ultricies.
                          </p>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                Duração: Xh Ymin
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Module 3 */}
                    <div className="col">
                      <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">Módulo 3</h5>
                          <p className="card-text flex-grow-1">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Aenean facilisis ligula sollicitudin viverra
                            pharetra. Ut ultricies sollicitudin augue sit amet
                            ultricies.
                          </p>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                Duração: Xh Ymin
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default CoursePage;
