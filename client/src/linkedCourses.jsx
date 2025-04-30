import React from "react";
import Sidebar from "./components/sidebar.jsx";
import NavbarDashboard from "./components/navbarDashboard.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import CourseCard from "./components/course_card.jsx";

const LinkedCourses = () => {
  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:4000/api/user/teacher-courses",
          {
            withCredentials: true,
          }
        );
        setCourses(response.data);
        console.log(response.data);
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
      <Sidebar onToggle={handleSidebarToggle} />
      <div className="container-fluid h-100 d-flex flex-column justify-content-center align-items-center p-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-12 mb-4">
              <div className="card h-100 w-100">
                <div className="card-header">
                  <h3 className="card-title mb-0">Cursos atribuidos</h3>
                </div>
                <div className="card-body">
                  {isLoading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : courses.length > 0 ? (
                    <div className="container p-0 mb-3">
                      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                        {courses.map((course) => (
                          <div className="col" key={course.ID_CURSO}>
                            <CourseCard course={course} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="card text-center"
                      style={{ width: "18rem" }}
                    >
                      <div className="card-body">
                        <h5 className="card-title">Cursos atribuidos</h5>
                        <p className="card-text">Sem cursos atribuidos</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkedCourses;
