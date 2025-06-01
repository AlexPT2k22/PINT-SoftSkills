import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/sidebar.css";
import {
  Home,
  BookOpen,
  FolderCog,
  NotebookPen,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  UserRoundCheck,
  ShieldAlert,
  LogOut,
  UsersRound,
} from "lucide-react";
import useAuthStore from "../store/authStore.js";

function Sidebar({ onToggle }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const location = useLocation();
  const { userType } = useAuthStore();
  const isFormador = userType === 2;
  const isGestor = userType === 3;

  // funcao para verificar se o link está ativo
  const isActive = (path) => {
    return location.pathname === path; // Verifica se o caminho atual é igual ao caminho do link
  };

  // Handle screen resize to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 992);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 992) {
        setCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle clicks outside the sidebar to close it
  useEffect(() => {
    // Handle clicks outside the sidebar
    const handleClickOutside = (event) => {
      // Get sidebar element
      const sidebarElement = document.querySelector(".sidebar");

      // If sidebar is open (not collapsed) and click is outside sidebar
      if (
        !collapsed &&
        sidebarElement &&
        !sidebarElement.contains(event.target) &&
        !event.target.closest(".sidebar-toggle-btn")
      ) {
        // Close the sidebar
        setCollapsed(true);
        if (onToggle) {
          onToggle(true);
        }
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [collapsed, onToggle]);

  // Toggle sidebar
  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  // Toggle sidebar - open only for mobile toggle button
  const openSidebar = () => {
    setCollapsed(false);
    if (onToggle) {
      onToggle(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button - Only visible on mobile */}
      <button
        className={`sidebar-toggle-btn ${
          mobileView && collapsed ? "visible" : ""
        }`}
        onClick={openSidebar}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="d-flex justify-content-end align-items-center">
            <button
              className="btn btn-link sidebar-close p-0"
              onClick={toggleSidebar}
            >
              {collapsed ? (
                <ChevronRight size={24} color="#39639C" />
              ) : (
                <X size={24} color="#39639C" />
              )}
            </button>
          </div>
        </div>

        <div className="sidebar-body">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                onClick={() => mobileView && setCollapsed(true)}
              >
                <Home size={20} className="me-3" />
                {!collapsed && <span>Dashboard</span>}
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/dashboard/my-courses"
                className={`nav-link ${
                  isActive("/dashboard/my-courses") ? "active" : ""
                }`}
                onClick={() => mobileView && setCollapsed(true)}
              >
                <BookOpen size={20} className="me-3" />
                {!collapsed && <span>Os meus cursos</span>}
              </Link>
            </li>
          </ul>

          <div className="sidebar-divider"></div>

          {(isGestor || isFormador) && (
            <>
              <ul className="nav flex-column mb-0">
                <li className="nav-item">
                  <Link
                    to="/dashboard/linked-courses"
                    className={`nav-link ${
                      isActive("/dashboard/linked-courses") ? "active" : ""
                    }`}
                    onClick={() => mobileView && setCollapsed(true)}
                  >
                    <UserRoundCheck size={20} className="me-3" />
                    {!collapsed && <span>Cursos atribuidos</span>}
                  </Link>
                </li>
                {isGestor && (
                  <>
                    <li className="nav-item">
                      <Link
                        to="/dashboard/create-course"
                        className={`nav-link ${
                          isActive("/dashboard/create-course") ? "active" : ""
                        }`}
                        onClick={() => mobileView && setCollapsed(true)}
                      >
                        <NotebookPen size={20} className="me-3" />
                        {!collapsed && <span>Criar curso</span>}
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        to="/dashboard/course-managemnent"
                        className={`nav-link ${
                          isActive("/dashboard/course-managemnent")
                            ? "active"
                            : ""
                        }`}
                        onClick={() => mobileView && setCollapsed(true)}
                      >
                        <ShieldAlert size={20} className="me-3" />
                        {!collapsed && <span>Gerir cursos</span>}
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        to="/dashboard/categories"
                        className={`nav-link ${
                          isActive("/dashboard/categories") ? "active" : ""
                        }`}
                        onClick={() => mobileView && setCollapsed(true)}
                      >
                        <FolderCog size={20} className="me-3" />
                        {!collapsed && <span>Gerir categorias</span>}
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        to="/dashboard/users"
                        className={`nav-link ${
                          isActive("/dashboard/users") ? "active" : ""
                        }`}
                        onClick={() => mobileView && setCollapsed(true)}
                      >
                        <UsersRound size={20} className="me-3" />
                        {!collapsed && <span>Gerir utilizadores</span>}
                      </Link>
                    </li>
                  </>
                )}
              </ul>
              <div className="sidebar-divider"></div>
            </>
          )}

          <ul className="nav flex-column mb-0">
            <li className="nav-item">
              <Link
                to="/dashboard/settings"
                className={`nav-link ${
                  isActive("/dashboard/settings") ? "active" : ""
                }`}
                onClick={() => mobileView && setCollapsed(true)}
              >
                <Settings size={20} className="me-3" />
                {!collapsed && <span>Definições</span>}
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/dashboard/ajuda"
                className={`nav-link ${
                  isActive("/dashboard/ajuda") ? "active" : ""
                }`}
                onClick={() => mobileView && setCollapsed(true)}
              >
                <HelpCircle size={20} className="me-3" />
                {!collapsed && <span>Ajuda</span>}
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link ${isActive("/logout") ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  useAuthStore.getState().logout();
                }}
              >
                <LogOut size={20} className="me-3" />
                {!collapsed && <span>Sair</span>}
              </Link>
            </li>
          </ul>
        </div>

        {!collapsed && (
          <div className="sidebar-footer">
            <div className="text-center">
              <p className="mb-0 small sidebar-footer-text">
                © 2025 SoftSkills
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile - closes sidebar when clicked */}
      {mobileView && !collapsed && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </>
  );
}

export default Sidebar;
