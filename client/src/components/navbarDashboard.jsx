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
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowUserDropdown(false);
  };

  return (
    <nav className="navbar sticky-top navbar-expand-lg">
      <div className="container-fluid">
        <a className="navbar-brand text ms-2" href="/">
          <div className="d-flex align-items-center">
            <img src="/images/Logo.svg" alt="Logo" className="logo" />
          </div>
        </a>

        <div className="d-flex align-items-center me-5">
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
