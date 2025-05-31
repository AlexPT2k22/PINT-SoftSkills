import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import {
  Search,
  Bell,
  Settings,
  CircleUserRound,
  ChevronDown,
  ChevronRight,
  SquareArrowOutUpRight,
} from "lucide-react";
import useAuthStore from "../store/authStore.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const URL =
  import.meta.env.PROD === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

function Navbar() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeArea, setActiveArea] = useState(null);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/find-courses?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  useEffect(() => {
    const getCategorias = async () => {
      try {
        const response = await axios.get(`${URL}/api/categorias/com-areas`);
        setCategorias(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      } finally {
        setLoading(false);
      }
    };

    getCategorias();

    const fetchTopics = async () => {
      try {
        const response = await axios.get(`${URL}/api/topicos/`);
        setTopics(response.data);
      } catch (error) {
        console.error("Erro ao buscar tópicos:", error);
        setTopics([]);
      }
    };

    fetchTopics();

    const handleClickOutside = (event) => {
      if (!event.target.closest(".mega-dropdown-wrapper")) {
        setShowMenu(false);
      }

      if (!event.target.closest(".nav-item.dropdown")) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar sticky-top navbar-expand-lg">
      <div className="container-fluid">
        <a className="navbar-brand text ms-2" href="/">
          <div className="d-flex align-items-center">
            <img src="/images/Logo.svg" alt="Logo" className="logo" />
          </div>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {/* Mega Dropdown */}
            <li className="nav-item mega-dropdown-wrapper">
              <a
                className="nav-link d-flex align-items-center text descobrir-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowMenu(!showMenu);
                }}
                onMouseEnter={() => setShowMenu(true)}
              >
                Descobrir
                <ChevronDown className="ms-1" size={18} color="#39639c" />
              </a>

              {/* Mega Dropdown Content */}
              {showMenu && (
                <div
                  className="mega-dropdown"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  {/* Left Panel - Categories */}
                  <div className="categories-panel">
                    {loading ? (
                      <div className="loading-item">A carregar...</div>
                    ) : (
                      categorias.map((categoria) => (
                        <div
                          key={categoria.ID_CATEGORIA__PK___}
                          className={`category-item ${
                            activeCategory === categoria.ID_CATEGORIA__PK___
                              ? "active"
                              : ""
                          }`}
                          onMouseEnter={() =>
                            setActiveCategory(categoria.ID_CATEGORIA__PK___)
                          }
                        >
                          <div
                            className="d-flex justify-content-between align-items-center w-100"
                            onClick={() => {
                              navigate(
                                `/categorias/${categoria.ID_CATEGORIA__PK___}`
                              );
                              setShowMenu(false);
                            }}
                          >
                            {categoria.NOME__}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Right Panel - Areas */}
                  <div className="areas-panel">
                    {activeCategory && !loading && (
                      <>
                        {categorias
                          .find(
                            (cat) => cat.ID_CATEGORIA__PK___ === activeCategory
                          )
                          ?.AREAs?.map((area) => (
                            <div
                              key={area.ID_AREA}
                              className={`area-item ${
                                activeArea === area.ID_AREA ? "active" : ""
                              }`}
                              onClick={() => {
                                navigate(`/areas/${area.ID_AREA}`);
                                setShowMenu(false);
                              }}
                              onMouseEnter={() => {
                                setActiveArea(area.ID_AREA);
                              }}
                            >
                              {area.NOME}
                            </div>
                          ))}
                      </>
                    )}
                  </div>

                  {/* Third Panel - Topics */}
                  <div className="topics-panel">
                    {activeArea && !loading && (
                      <>
                        {topics.filter((topic) => topic.ID_AREA === activeArea)
                          .length > 0 &&
                          topics
                            .filter((topic) => topic.ID_AREA === activeArea)
                            .map((topic) => (
                              <div
                                key={topic.ID_TOPICO}
                                className="topic-item"
                                onClick={() => {
                                  navigate(`/topicos/${topic.ID_TOPICO}`);
                                  setShowMenu(false);
                                }}
                                title={topic.TITULO}
                              >
                                {topic.TITULO}
                              </div>
                            ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </li>
          </ul>

          <form className="d-flex flex-grow-1 mx-4" onSubmit={handleSearch}>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 search-input">
                <Search strokeWidth={1.5} color="#39639C" />
              </span>
              <input
                type="search"
                className="form-control border-start-0 ps-0 search-input"
                placeholder="Procure por um curso"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Pesquisar
              </button>
            </div>
          </form>

          <ul className="navbar-nav me-5">
            <li className="nav-item">
              <a className="nav-link text align-items-center" href="#">
                Fórum
                <SquareArrowOutUpRight
                  color="#39639C"
                  size={18}
                  className="ms-2"
                />
              </a>
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <Bell strokeWidth={1.5} color="#39639C" size={22} />
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/dashboard/settings">
                    <Settings strokeWidth={1.5} color="#39639C" size={22} />
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link d-flex align-items-center"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowUserDropdown(!showUserDropdown);
                      e.stopPropagation(); // Prevent this click from closing the dropdown immediately
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
                      style={{ transform: "translatex(-20px)" }}
                    >
                      <li>
                        <a className="dropdown-item" href="/dashboard">
                          Dashboard
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          href="/dashboard/my-courses"
                        >
                          Os meus Cursos
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
                    className="btn btn-primary button-login"
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
