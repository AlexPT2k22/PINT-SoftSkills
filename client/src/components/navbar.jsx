import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import {
  Search,
  Settings,
  CircleUserRound,
  ChevronDown,
} from "lucide-react";
import useAuthStore from "../store/authStore.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import NotificationsDropdown from "./NotificationsDropdown";
import "../styles/notifications.css";
import "../styles/userdropdown.css";

const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);

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
        console.error("Erro ao procurar categorias:", error);
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
        console.error("Erro ao procurar tópicos:", error);
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
    setShowMenu(false);
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
          <form
            className="d-lg-none search-form-mobile"
            onSubmit={(e) => {
              handleSearch(e);
              closeNavbar();
            }}
          >
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 search-input-navbar">
                <Search strokeWidth={1.5} color="#39639C" />
              </span>
              <input
                type="search"
                className="form-control border-start-0 ps-0 search-input-navbar"
                placeholder="Procure por um curso"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn mt-2 w-100"
              style={{ backgroundColor: "#39639c", color: "#fff" }}
            >
              Pesquisar
            </button>
          </form>

          <ul className="navbar-nav d-lg-none">
            <li className="nav-item mega-dropdown-wrapper mobile-nav-item">
              <a
                className="nav-link d-flex align-items-center justify-content-between text descobrir-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowMenu(!showMenu);
                }}
              >
                <span>Descobrir</span>
                <ChevronDown className="ms-1" size={18} color="#39639c" />
              </a>

              {showMenu && (
                <div className="mega-dropdown">
                  <div className="categories-panel">
                    <h6 className="px-3 py-2 mb-0 text-muted">Categorias</h6>
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
                          onClick={() => {
                            if (
                              activeCategory === categoria.ID_CATEGORIA__PK___
                            ) {
                              setActiveCategory(null);
                            } else {
                              setActiveCategory(categoria.ID_CATEGORIA__PK___);
                              setActiveArea(null);
                            }
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100">
                            <span>{categoria.NOME__}</span>
                            <ChevronDown
                              className={`chevron-icon ${
                                activeCategory === categoria.ID_CATEGORIA__PK___
                                  ? "rotate-180"
                                  : ""
                              }`}
                              size={16}
                              color="#39639c"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {activeCategory && (
                    <div className="areas-panel">
                      <h6 className="px-3 py-2 mb-0 text-muted">Áreas</h6>
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
                              if (activeArea === area.ID_AREA) {
                                setActiveArea(null);
                              } else {
                                setActiveArea(area.ID_AREA);
                              }
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center w-100">
                              <span>{area.NOME}</span>
                              <ChevronDown
                                className={`chevron-icon ${
                                  activeArea === area.ID_AREA
                                    ? "rotate-180"
                                    : ""
                                }`}
                                size={16}
                                color="#39639c"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {activeArea && (
                    <div className="topics-panel">
                      <h6 className="px-3 py-2 mb-0 text-muted">Tópicos</h6>
                      {topics
                        .filter((topic) => topic.ID_AREA === activeArea)
                        .map((topic) => (
                          <div
                            key={topic.ID_TOPICO}
                            className="topic-item"
                            onClick={() => {
                              const areaDoTopico = categorias
                                .flatMap((cat) => cat.AREAs || [])
                                .find((area) =>
                                  topics.some(
                                    (t) =>
                                      t.ID_TOPICO === topic.ID_TOPICO &&
                                      t.ID_AREA === area.ID_AREA
                                  )
                                );

                              const categoriaDoTopico = categorias.find((cat) =>
                                cat.AREAs?.some(
                                  (a) => a.ID_AREA === areaDoTopico?.ID_AREA
                                )
                              );

                              navigate(
                                `/find-courses?category=${categoriaDoTopico?.ID_CATEGORIA__PK___}&area=${areaDoTopico?.ID_AREA}&topic=${topic.ID_TOPICO}`
                              );
                              closeNavbar();
                            }}
                            title={topic.TITULO}
                          >
                            {topic.TITULO}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </li>

            <li className="nav-item mobile-nav-item">
              <a className="nav-link text" href="/forum" onClick={closeNavbar}>
                Fórum
              </a>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item mobile-nav-item">
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text" style={{ color: '#39639c' }}>Notificações</span>
                    <NotificationsDropdown />
                  </div>
                </li>

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
                        onClick={() => handleNavigation("/dashboard/my-courses")}
                      >
                        Os meus Cursos
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleNavigation("/dashboard/settings")}
                      >
                        Configurações
                      </button>
                      <button className="btn logout-btn" onClick={handleLogout}>
                        Sair
                      </button>
                    </div>
                  </div>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <div className="auth-buttons-mobile">
                  <button
                    className="btn btn-primary button-sign"
                    type="button"
                    onClick={() => {
                      navigate("/login?login=0");
                      closeNavbar();
                    }}
                  >
                    Criar conta
                  </button>
                  <button
                    className="btn btn-primary button-login"
                    type="button"
                    onClick={() => {
                      navigate("/login?login=1");
                      closeNavbar();
                    }}
                  >
                    Entrar
                  </button>
                </div>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-none d-lg-flex">
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

              {showMenu && (
                <div
                  className="mega-dropdown"
                  onMouseLeave={() => setShowMenu(false)}
                >
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
                                `/find-courses?category=${categoria.ID_CATEGORIA__PK___}`
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
                                const categoriaId = categorias.find((cat) =>
                                  cat.AREAs?.some(
                                    (a) => a.ID_AREA === area.ID_AREA
                                  )
                                )?.ID_CATEGORIA__PK___;

                                navigate(
                                  `/find-courses?category=${categoriaId}&area=${area.ID_AREA}`
                                );
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
                                  const areaDoTopico = categorias
                                    .flatMap((cat) => cat.AREAs || [])
                                    .find((area) =>
                                      topics.some(
                                        (t) =>
                                          t.ID_TOPICO === topic.ID_TOPICO &&
                                          t.ID_AREA === area.ID_AREA
                                      )
                                    );

                                  const categoriaDoTopico = categorias.find(
                                    (cat) =>
                                      cat.AREAs?.some(
                                        (a) =>
                                          a.ID_AREA === areaDoTopico?.ID_AREA
                                      )
                                  );

                                  navigate(
                                    `/find-courses?category=${categoriaDoTopico?.ID_CATEGORIA__PK___}&area=${areaDoTopico?.ID_AREA}&topic=${topic.ID_TOPICO}`
                                  );
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

          <form
            className="d-none d-lg-flex flex-grow-1 mx-4"
            onSubmit={handleSearch}
          >
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 search-input-navbar">
                <Search strokeWidth={1.5} color="#39639C" />
              </span>
              <input
                type="search"
                className="form-control border-start-0 ps-0 search-input-navbar"
                placeholder="Procure por um curso"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="btn"
                style={{ backgroundColor: "#39639c", color: "#fff" }}
              >
                Pesquisar
              </button>
            </div>
          </form>

          <ul className="navbar-nav me-5 d-none d-lg-flex">
            <li className="nav-item">
              <a className="nav-link text align-items-center" href="/forum">
                Fórum
              </a>
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <NotificationsDropdown />
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
                      e.stopPropagation();
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
                          <span>Os meus cursos</span>
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
