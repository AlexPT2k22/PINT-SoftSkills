import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import { Pen, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import SuccessMessage from "./components/sucess_message";
import ErrorMessage from "./components/error_message";

function ListCoursesDashboard() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingAssets(true);
        const response = await fetch("http://localhost:4000/api/cursos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
      <NavbarDashboard />
      <Sidebar />
      <div className={`container mt-4 p-4`}>
        {showSuccessMessage && (
          <SuccessMessage
            message={"Curso apagado com sucesso!"}
            onClose={() => setShowSuccessMessage(false)}
          />
        )}
        {showErrorMessage && (
          <ErrorMessage
            message={errorMessage}
            onClose={() => setShowErrorMessage(false)}
          />
        )}

        <h3 className="mb-4">Lista de cursos</h3>

        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="text-center">
              <tr>
                <th>Nome do curso</th>
                <th>Categoria/Area/Tópico</th>
                <th>Tipo de curso</th>
                <th>Formador</th>
                <th>Data de início e fim</th>
                <th>Vagas</th>
                <th>Estado</th>
                <th>Data de criação/edição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody className="text-center align-middle">
              {isLoadingAssets ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course.ID_CURSO}>
                    <td>{course.NOME}</td>
                    <td>
                      {course.AREA.NOME}/{course.AREA.Categoria.NOME__}
                    </td>
                    <td>
                      {course.CURSO_SINCRONO === null
                        ? "Assíncrono"
                        : "Síncrono"}
                    </td>
                    <td>
                      {course.CURSO_SINCRONO === null
                        ? "N/A"
                        : course.CURSO_SINCRONO.UTILIZADOR?.NOME ||
                          course.CURSO_SINCRONO.UTILIZADOR?.USERNAME ||
                          "Sem formador atribuído"}
                    </td>
                    <td>{`${
                      (course.CURSO_SINCRONO &&
                        course.CURSO_SINCRONO.DATA_INICIO) ||
                      (course.CURSO_ASSINCRONO &&
                        course.CURSO_ASSINCRONO.DATA_INICIO)
                        ? new Date(
                            (course.CURSO_SINCRONO &&
                              course.CURSO_SINCRONO.DATA_INICIO) ||
                              (course.CURSO_ASSINCRONO &&
                                course.CURSO_ASSINCRONO.DATA_INICIO)
                          ).toLocaleDateString()
                        : "N/A"
                    } - ${
                      (course.CURSO_SINCRONO &&
                        course.CURSO_SINCRONO.DATA_FIM) ||
                      (course.CURSO_ASSINCRONO &&
                        course.CURSO_ASSINCRONO.DATA_FIM)
                        ? new Date(
                            (course.CURSO_SINCRONO &&
                              course.CURSO_SINCRONO.DATA_FIM) ||
                              (course.CURSO_ASSINCRONO &&
                                course.CURSO_ASSINCRONO.DATA_FIM)
                          ).toLocaleDateString()
                        : "N/A"
                    }`}</td>
                    <td>
                      {course.CURSO_SINCRONO === null
                        ? "N/A"
                        : course.CURSO_SINCRONO.VAGAS}
                    </td>
                    <td>
                      {course.CURSO_SINCRONO === null
                        ? course.CURSO_ASSINCRONO.ESTADO
                        : course.CURSO_SINCRONO.ESTADO}
                    </td>
                    <td>
                      {new Date(course.DATA_CRIACAO__).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="d-flex justify-content-center">
                        <button
                          className="btn btn-primary btn-sm me-1"
                          onClick={() =>
                            navigate(
                              `/dashboard/course/edit/${course.ID_CURSO}`
                            )
                          }
                        >
                          <Pen size={16} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm me-1"
                          onClick={() => navigate(`/course/${course.ID_CURSO}`)}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    Nenhum curso encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ListCoursesDashboard;
