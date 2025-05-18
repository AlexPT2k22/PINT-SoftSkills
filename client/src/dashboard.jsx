import React from "react";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import useAuthStore from "./store/authStore";
import CourseCardDashboard from "./components/courseCardDashboard";
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [courseProgress, setCourseProgress] = useState({});
  const [courses, setCourses] = useState([]);

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

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };
  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />
      <div className="container h-100 d-flex justify-content-center align-items-center flex-column p-4">
        <h1>Bem vindo, {user.username}</h1>
        <div className="container d-flex flex-column">
          <h2 className="mt-4">Dashboard</h2>
          <div className="">graficos</div>
          <h2>Os meus cursos</h2>
          <div className="container d-flex flex-row p-0">
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
              <div className="card text-center" style={{ width: "18rem" }}>
                <div className="card-body">
                  <h5 className="card-title">Cursos inscritos</h5>
                  <p className="card-text">Não está inscrito a nenhum curso</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
