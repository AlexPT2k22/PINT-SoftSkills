import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "./components/navbar.jsx";
import Loader from "./components/loader.jsx";
import useAuthStore from "./store/authStore.js";
import "./styles/welcomepage.css";
import CourseCard from "./components/course_card.jsx";

const URL =
  import.meta.env.PROD === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

function WelcomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${URL}/api/cursos`);
        console.log("Cursos:", response.data);
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erro a encontrar os cursos:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <Loader />;
  }

  //TODO: add error handling UI

  return (
    <>
      <Navbar />
      <div className="container d-flex justify-content-start banner">
        <div className="p-4 d-flex flex-column justify-content-center ms-5">
          <div className="d-flex flex-column text-start">
            <div className="d-flex flex-column justify-content-start shadow border-2 rounded-3 p-4 message-box">
              <h2>Aprenda novas habilidades</h2>
              <p>Estude com mais de 100 cursos disponiveis!</p>
              <div className="d-flex justify-content-start">
                <button className="btn btn-primary">Começar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container d-flex flex-column mt-5">
        <div className="d-flex flex-column justify-content-start mb-3">
          <h1>Os mais populares</h1>
          <p className="mb-2">
            Explore os nossos cursos mais populares e prepare-se para aprender
            novas habilidades
          </p>
        </div>
        <div className="container p-0">
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {courses.map((course) => (
              <div className="col" key={course.ID_CURSO}>
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePage;
