import React from "react";
import Sidebar from "./components/sidebar.jsx";
import NavbarDashboard from "./components/navbarDashboard.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import CourseCardDashboard from "./components/courseCardDashboard.jsx";

function CoursesUser() {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [courseProgress, setCourseProgress] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${URL}/api/user/student-courses`,
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
        const coursesData = response.data;
        setCourses(coursesData);
        const progressMap = {};
        await Promise.all(
          coursesData.map(async (course) => {
            try {
              const progressResponse = await axios.get(
                `${URL}/api/progress/courses/${course.ID_CURSO}/progress`,
                { withCredentials: true }
              );

              if (progressResponse.data.success) {
                progressMap[course.ID_CURSO] = {
                  percentualProgresso:
                    progressResponse.data.percentualProgresso,
                  modulosCompletos: progressResponse.data.modulosCompletos,
                  totalModulos: progressResponse.data.totalModulos,
                };
              }
            } catch (err) {
              console.error(
                `Percurso deu erro em: ${course.ID_CURSO}:`,
                err
              );
            }
          })
        );
        setCourseProgress(progressMap);
      } catch (error) {
        console.error("Erro a procurar percurso:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
      <NavbarDashboard />
      <Sidebar />
      <div className="container mt-4 p-4">
        <h2 className="mb-4">Os meus cursos</h2>

        {isLoading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">A carregar...</span>
            </div>
          </div>
        ) : courses.length > 0 ? (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {courses.map((course) => (
              <div className="col" key={course.ID_CURSO}>
                <CourseCardDashboard
                  course={course}
                  showStartButton={true}
                  showProgress={true}
                  progress={
                    courseProgress[course.ID_CURSO]?.percentualProgresso || 0
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info">
            Não está inscrito em nenhum curso
          </div>
        )}
      </div>
    </>
  );
}

export default CoursesUser;
