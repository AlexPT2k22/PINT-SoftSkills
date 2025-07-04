// client/src/components/navbarDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  CircleUserRound,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import NotificationsDropdown from "./NotificationsDropdown";
import "../styles/notifications.css";
import "../styles/userdropdown.css";

function NavbarDashboard({ showIcons = true }) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-dropdown-wrapper")) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate("/");
    setShowUserDropdown(false);
    setIsNavbarCollapsed(true);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowUserDropdown(false);
    setIsNavbarCollapsed(true);
  };

  const toggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
  };

  const closeNavbar = () => {
    setIsNavbarCollapsed(true);
    setShowUserDropdown(false);
  };

  return (
    <nav className="navbar sticky-top navbar-expand-lg">
      <div className="container-fluid">
        <a className="navbar-brand text ms-2" href="/" onClick={closeNavbar}>
          <div className="d-flex align-items-center">
            <img src="/images/Logo.svg" alt="Logo" className="logo" />
          </div>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-expanded={!isNavbarCollapsed}
          aria-controls="navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`navbar-collapse ${
            isNavbarCollapsed ? "collapse" : "show"
          }`}
          id="navbarContent"
        >
          {/* Mobile Navigation */}
          <div className="d-lg-none">
            {showIcons && (
              <ul className="navbar-nav">
                {/* Forum Link Mobile */}
                <li className="nav-item mobile-nav-item">
                  <a
                    className="nav-link text"
                    href="/forum"
                    onClick={closeNavbar}
                  >
                    Fórum
                  </a>
                </li>

                {/* Notifications Mobile */}
                <li className="nav-item mobile-nav-item">
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text" style={{ color: "#39639c" }}>
                      Notificações
                    </span>
                    <NotificationsDropdown />
                  </div>
                </li>

                {/* User Section Mobile */}
                <li className="nav-item">
                  <div className="user-section-mobile">
                    <div className="user-info-mobile">
                      <div className="user-avatar ms-0">
                        <CircleUserRound size={32} color="#39639C" />
                      </div>
                      <div className="user-details">
                        <h6>@{user?.username}</h6>
                        <small className="text-muted">{user?.email}</small>
                      </div>
                    </div>

                    <div className="user-actions-mobile">
                      <button
                        className="btn"
                        onClick={() => handleNavigation(`/user/${user?.id}`)}
                      >
                        Perfil
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleNavigation("/dashboard")}
                      >
                        Dashboard
                      </button>
                      <button
                        className="btn"
                        onClick={() =>
                          handleNavigation("/dashboard/my-courses")
                        }
                      >
                        Os meus Cursos
                      </button>
                      <button className="btn logout-btn" onClick={handleLogout}>
                        Sair
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center ms-auto me-5">
            {showIcons && (
              <ul className="navbar-nav flex-row">
                <li className="nav-item">
                  <a className="nav-link text align-items-center" href="/forum">
                    Fórum
                  </a>
                </li>
                <li className="nav-item">
                  <NotificationsDropdown />
                </li>

                <li className="nav-item">
                  <div className="user-dropdown-wrapper">
                    <button
                      className="btn btn-link nav-link d-flex align-items-center"
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      style={{
                        border: "none",
                        background: "none",
                        textDecoration: "none",
                      }}
                    >
                      <CircleUserRound
                        strokeWidth={1.5}
                        color="#39639C"
                        size={22}
                      />
                      <span className="ms-2 text-dark">{user?.username}</span>
                      <ChevronDown
                        className={`ms-1 transition-transform ${
                          showUserDropdown ? "rotate-180" : ""
                        }`}
                        size={18}
                        color="#39639c"
                      />
                    </button>

                    {showUserDropdown && (
                      <div className="user-dropdown">
                        <a
                          href={`/user/${user?.id}`}
                          className="user-dropdown-header"
                        >
                          <div className="user-dropdown-info">
                            <div className="user-dropdown-avatar">
                              <CircleUserRound size={32} color="#39639C" />
                            </div>
                            <div className="user-dropdown-details">
                              <h6 className="user-dropdown-name">
                                @{user?.username}
                              </h6>
                              <small className="user-dropdown-email text-muted">
                                {user?.email}
                              </small>
                            </div>
                          </div>
                        </a>

                        <div className="user-dropdown-list">
                          <button
                            className="user-dropdown-item"
                            onClick={() => handleNavigation("/dashboard")}
                          >
                            <span>Dashboard</span>
                          </button>

                          <button
                            className="user-dropdown-item"
                            onClick={() =>
                              handleNavigation("/dashboard/my-courses")
                            }
                          >
                            <span>Os meus Cursos</span>
                          </button>

                          <div className="user-dropdown-divider"></div>

                          <button
                            className="user-dropdown-item logout-item"
                            onClick={handleLogout}
                          >
                            <span>Sair</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Backdrop para fechar dropdown */}
                    {showUserDropdown && (
                      <div
                        className="user-dropdown-backdrop"
                        onClick={() => setShowUserDropdown(false)}
                      />
                    )}
                  </div>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavbarDashboard;
