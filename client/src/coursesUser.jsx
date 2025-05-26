import React from "react";
import Sidebar from "./components/sidebar.jsx";
import NavbarDashboard from "./components/navbarDashboard.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import CourseCardDashboard from "./components/courseCardDashboard.jsx";

const CoursesUser = () => {
  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [courseProgress, setCourseProgress] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:4000/api/user/student-courses",
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
                `http://localhost:4000/api/progress/courses/${course.ID_CURSO}/progress`,
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
                `Failed to fetch progress for course ${course.ID_CURSO}:`,
                err
              );
            }
          })
        );
        setCourseProgress(progressMap);
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
              <div className="container">
                <h2 className="">Os meus cursos</h2>

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
                          <CourseCardDashboard
                            course={course}
                            showStartButton={true}
                            showProgress={true}
                            progress={
                              courseProgress[course.ID_CURSO]
                                ?.percentualProgresso || 0
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="container">
                    <h5 className="title">Cursos inscritos</h5>
                    <p className="text">Não está inscrito a nenhum curso</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursesUser;
