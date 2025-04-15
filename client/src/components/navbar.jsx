import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { Search } from "lucide-react";
import { Bell } from "lucide-react";
import { Settings } from "lucide-react";
import { CircleUserRound } from "lucide-react";

function Navbar({ isAuthenticated }) {
  //const isLogedin = false;
  const navigate = useNavigate();
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        {/* Logo */}
        <a className="navbar-brand text ms-2" href="#">
          <div className="d-flex align-items-center">
            <img src="/images/Logo.svg" alt="Logo" className="logo" />
          </div>
        </a>

        {/* Hamburger Menu */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link text-primary text-descobrir text" href="#">
                Descobrir
              </a>
            </li>
          </ul>

          {/* Search Bar */}
          <form className="d-flex flex-grow-1 mx-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 search-input">
                <Search strokeWidth={1.5} color="#39639C" />
              </span>
              <input
                type="search"
                className="form-control border-start-0 search-input"
                placeholder="Procure por um curso"
                aria-label="Search"
              />
            </div>
          </form>

          {/* Right side links */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <a
                className="nav-link text-primary text-decoration-underline text"
                href="#"
              >
                Torne-se Formador
              </a>
            </li>
            {isLogedin ? (
              <>
                <li className="nav-item">
                  <a className="nav-link text-primary me-2 text" href="#">
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <Bell strokeWidth={1.5} color="#39639C" size={22} />
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <Settings strokeWidth={1.5} color="#39639C" size={22} />
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link me-5" href="#">
                    <CircleUserRound
                      strokeWidth={1.5}
                      color="#39639C"
                      size={22}
                    />
                  </a>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <button
                    className="btn btn-primary me-3 ms-4 button-sign"
                    type="button"
                    onClick={() => navigate("/login?login=0")}
                  >
                    Criar conta
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-primary me-5 button-login"
                    type="button"
                    onClick={() => navigate("/login?login=1")}
                  >
                    Entrar
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
