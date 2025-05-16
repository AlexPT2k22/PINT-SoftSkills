import React, { useState, useEffect } from "react";
import { Bell, CircleUserRound, ChevronDown } from "lucide-react";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

function NavbarDashboard({
  showProgress = false,
  progressData = null,
  showIcons = true,
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".nav-item.dropdown")) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderProgressBar = () => {
    if (!showProgress || !progressData) {
      return null;
    }
    return (
      <div
        className="progress-container ms-auto me-3"
        style={{ width: "200px" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-1">
          <small>Progresso do curso</small>
          <small>{progressData.percentualProgresso}%</small>
        </div>
        <div className="progress" style={{ height: "8px" }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${progressData.percentualProgresso}%` }}
            aria-valuenow={progressData.percentualProgresso}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>
    );
  };

  return (
    <nav className="navbar sticky-top navbar-expand-lg">
      <div className="container-fluid">
        <a className="navbar-brand text ms-2" href="/">
          <div className="d-flex align-items-center">
            <img src="/images/Logo.svg" alt="Logo" className="logo" />
          </div>
        </a>

        {renderProgressBar()}

        <div className="d-flex align-items-center me-5">
          {showIcons && (
            <ul className="navbar-nav flex-row">
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <Bell strokeWidth={1.5} color="#39639C" size={22} />
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link d-flex align-items-center"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowUserDropdown(!showUserDropdown);
                  }}
                >
                  <CircleUserRound
                    strokeWidth={1.5}
                    color="#39639C"
                    size={22}
                  />
                  <span className="ms-2">{user?.username}</span>
                  <ChevronDown className="ms-1" size={18} color="#39639c" />
                </a>
                {showUserDropdown && (
                  <ul
                    className="dropdown-menu dropdown-menu-end show"
                    style={{ transform: "translateX(-20px)" }}
                  >
                    <li>
                      <a className="dropdown-item" href="/dashboard">
                        Dashboard
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="/dashboard/my-courses">
                        Meus Cursos
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          useAuthStore.getState().logout();
                        }}
                      >
                        Sair
                      </a>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          )}
        </div>

        <button
          className="navbar-toggler ms-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
}

export default NavbarDashboard;
