import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import { Pen, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import SuccessMessage from "./components/sucess_message";
import ErrorMessage from "./components/error_message";

function ListCoursesDashboard() {
  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };
  const [collapsed, setCollapsed] = useState(false);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
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
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />
      <div className="container-fluid h-100 d-flex justify-content-center align-items-center p-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-12 mb-4">
              <div className="card h-100 w-100">
                <div className="card-header">
                  <h3 className="card-title mb-0">Lista de cursos</h3>
                </div>
                <div className="card-body">
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
                    <tbody className="text-center">
                      {courses.map((course) => (
                        <tr key={course.id}>
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
                              : course.CURSO_SINCRONO.UTILIZADOR.USERNAME}
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
                            {new Date(
                              course.DATA_CRIACAO__
                            ).toLocaleDateString()}
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-primary me-2"
                              onClick={() =>
                                navigate(
                                  `/dashboard/course/edit/${course.ID_CURSO}`
                                )
                              }
                            >
                              <Pen size={16} />
                            </button>
                            <button className="btn btn-danger">
                              <Trash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ListCoursesDashboard;
