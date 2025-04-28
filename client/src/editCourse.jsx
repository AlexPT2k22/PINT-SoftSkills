import React from "react";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ButtonWithLoader from "./components/butao_loader";

function EditCourse() {
  const requiredSteps = [
    "Title",
    "Description",
    "Category",
    "Area",
    "Topic",
    "Image",
  ];
  const { courseId } = useParams();
  const navigate = useNavigate();
  const steps = requiredSteps.length;
  const completedSteps = requiredSteps.filter((step) => step.completed).length;
  const remainingSteps = steps - completedSteps;
  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };
  const [courseData, setCourseData] = useState(null);
  const [category, setCategory] = useState([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(0);
  const [areaId, setAreaId] = useState(0);

  useEffect(() => {
    const fetchCourseData = async () => {
      console.log(`http://localhost:4000/api/cursos/${courseId}`);
      try {
        const response = await axios.get(
          `http://localhost:4000/api/cursos/${courseId}`
        );
        setCourseData(response.data);
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    };
    const getAreas = async () => {
      try {
        setIsLoadingAttributes(true);
        const response = await axios.get(
          "http://localhost:4000/api/categorias/com-areas"
        ); // Adjust the endpoint as needed
        if (response.status === 200) {
          //console.log("Areas fetched successfully:", response.data);
          setCategory(response.data);
        } else {
          //console.error("Error fetching category:", response.statusText);
          setError("Erro ao buscar áreas. Tente novamente mais tarde.");
        }
      } catch (error) {
        //console.error("Error fetching category:", error);
        setError("Erro ao buscar áreas. Tente novamente mais tarde.");
      } finally {
        setIsLoadingAttributes(false);
      }
    };
    getAreas();

    fetchCourseData();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:4000/api/cursos/${courseId}`,
        {
          NOME: title,
          DESCRICAO_OBJETIVOS__: description,
          ID_AREA: areaId,
          ID_CATEGORIA__PK___: categoryId,
        }
      );
      if (response.status === 200) {
        console.log("Curso atualizado com sucesso:", response.data);
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />
      <div className="container h-100 d-flex justify-content-center align-items-center flex-column p-4">
        <h1 className="mb-0">Editar curso</h1>
        <p className="mb-0">Id do curso: {courseId}</p>
        <span>
          <p>Passos completos: {`${completedSteps}/${steps}`}</p>
        </span>
        <div className="container ">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <form onSubmit={handleSubmit}>
                <label htmlFor="name" className="form-label">
                  Nome do curso:
                </label>
                <input
                  type="text"
                  className="form-control mb-3"
                  id="name"
                  placeholder={courseData?.NOME || "Nome do curso"}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsValid(true);
                  }}
                  value={title}
                  required
                />
                <label htmlFor="description" className="form-label">
                  Descrição do curso:
                </label>
                <textarea
                  className="form-control mb-3"
                  id="description"
                  rows="3"
                  placeholder={
                    courseData?.DESCRICAO_OBJETIVOS__ || "Descrição do curso"
                  }
                  required
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsValid(true);
                  }}
                  value={description}
                ></textarea>
                <label htmlFor="courseImage" className="form-label">
                  Imagem do Curso:
                </label>
                <input
                  type="file"
                  className="form-control mb-3"
                  id="courseImage"
                  accept="image/png, image/jpeg, image/jpg" // TODO: Add a file upload handler
                  required
                />
                <div>
                  <label htmlFor="courseDifficulty" className="form-label me-3">
                    Dificuldade do Curso:
                  </label>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="radioDefault"
                      id="Dificuldade1"
                      value={"Iniciante"}
                    />
                    <label className="form-check-label" htmlFor="Dificuldade1">
                      Iniciante
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="radioDefault"
                      id="Dificuldade2"
                      value={"Intermédio"}
                    />
                    <label className="form-check-label" htmlFor="Dificuldade2">
                      Intermédio
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="radioDefault"
                      id="Dificuldade3"
                      value={"Difícil"}
                    />
                    <label className="form-check-label" htmlFor="Dificuldade3">
                      Difícil
                    </label>
                  </div>
                </div>
                <label htmlFor="courseCategory" className="form-label">
                  Categoria do Curso:
                </label>
                {isLoadingAttributes ? (
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <select
                    className="form-select mb-3"
                    id="courseCategory"
                    required
                    defaultValue={0}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setIsValid(true);
                    }}
                  >
                    <option value="0" disabled>
                      {`Categoria atribuida: ${
                        courseData?.AREA?.Categoria?.NOME__ ||
                        "Selecione uma área"
                      }`}
                    </option>
                    {category.map((category) => (
                      <option
                        key={category.ID_CATEGORIA__PK___}
                        value={category.ID_CATEGORIA__PK___}
                      >
                        {category.NOME__}
                      </option>
                    ))}
                  </select>
                )}
                <label htmlFor="courseArea" className="form-label">
                  Área do Curso:
                </label>
                {isLoadingAttributes ? (
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <select
                    className="form-select mb-3"
                    id="courseArea"
                    required
                    defaultValue={0}
                    onChange={(e) => {
                      setAreaId(e.target.value);
                      setIsValid(true);
                    }}
                  >
                    <option value="0" disabled>
                      {`Área atribuida: ${
                        courseData?.AREA?.NOME || "Selecione uma área"
                      }`}
                    </option>
                    {category.map((category) =>
                      category.AREAs.map((area) => (
                        <option key={area.ID_AREA} value={area.ID_AREA}>
                          {area.NOME}
                        </option>
                      ))
                    )}
                  </select>
                )}
                <div className="d-flex flex-row align-items-center gap-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: "200px" }}
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !isValid}
                    className="btn btn-primary"
                    style={{ width: "200px" }}
                  >
                    {isLoading ? (
                      <ButtonWithLoader isLoading={isLoading} />
                    ) : (
                      "Editar curso"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditCourse;
