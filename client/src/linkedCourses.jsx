import React from "react";
import Sidebar from "./components/sidebar.jsx";
import NavbarDashboard from "./components/navbarDashboard.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import CourseCardDashboard from "./components/courseCardDashboard.jsx";

const LinkedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${URL}/api/user/teacher-courses`, {
          withCredentials: true,
        });
        console.log(response.data);
        const coursesData = response.data;
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
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
      <div className={`container mt-4 p-4 `}>
        <h2 className="mb-4">Cursos atribuidos</h2>

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
                  showProgress={false}
                  isTeacher={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info">
            Não tem cursos atribuídos para lecionar
          </div>
        )}
      </div>
    </>
  );
};

export default LinkedCourses;
