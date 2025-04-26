import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/sidebar.css";
import {
  Home,
  BookOpen,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  NotebookPen,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  UserRoundCheck,
} from "lucide-react";
import useAuthStore from "../store/authStore.js";

function Sidebar({ onToggle }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const location = useLocation();
  const { userType } = useAuthStore();
  const isFormador = userType === 2; // Check if user is a formador (trainer)

  // Check if current path matches the menu item path
  const isActive = (path) => {
    return location.pathname === path;
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

  // Toggle sidebar
  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button - Only visible on mobile */}
      <button
        className={`sidebar-toggle-btn ${
          mobileView && collapsed ? "visible" : ""
        }`}
        onClick={toggleSidebar}
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
                to="/"
                className={`nav-link ${isActive("/") ? "active" : ""}`}
                onClick={() => mobileView && setCollapsed(true)}
              >
                <Home size={20} className="me-3" />
                {!collapsed && <span>Dashboard</span>}
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/cursos"
                className={`nav-link ${isActive("/cursos") ? "active" : ""}`}
                onClick={() => mobileView && setCollapsed(true)}
              >
                <BookOpen size={20} className="me-3" />
                {!collapsed && <span>Os meus cursos</span>}
              </Link>
            </li>

            {isFormador && (
              <li className="nav-item">
                <Link
                  to="/cursos" // FIXME: Change to "/cursos" for formadores
                  className={`nav-link ${isActive("/cursos") ? "active" : ""}`}
                  onClick={() => mobileView && setCollapsed(true)}
                >
                  <UserRoundCheck size={20} className="me-3" />
                  {!collapsed && <span>Cursos atribuidos</span>}
                </Link>
              </li>
            )}

            {isFormador && (
              <li className="nav-item">
                <Link
                  to="/formadores"
                  className={`nav-link ${
                    isActive("/formadores") ? "active" : ""
                  }`}
                  onClick={() => mobileView && setCollapsed(true)}
                >
                  <NotebookPen size={20} className="me-3" />
                  {!collapsed && <span>Criar curso</span>}
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link
                to="/certificados"
                className={`nav-link ${
                  isActive("/certificados") ? "active" : ""
                }`}
                onClick={() => mobileView && setCollapsed(true)}
              >
                <FileText size={20} className="me-3" />
                {!collapsed && <span>Certificados</span>}
              </Link>
            </li>
          </ul>

          <div className="sidebar-divider"></div>

          <ul className="nav flex-column mb-0">
            <li className="nav-item">
              <Link
                to="/definicoes"
                className={`nav-link ${
                  isActive("/definicoes") ? "active" : ""
                }`}
                onClick={() => mobileView && setCollapsed(true)}
              >
                <Settings size={20} className="me-3" />
                {!collapsed && <span>Definições</span>}
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/ajuda"
                className={`nav-link ${isActive("/ajuda") ? "active" : ""}`}
                onClick={() => mobileView && setCollapsed(true)}
              >
                <HelpCircle size={20} className="me-3" />
                {!collapsed && <span>Ajuda</span>}
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
