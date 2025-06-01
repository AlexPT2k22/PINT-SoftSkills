// client/src/findCourses.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import CourseCard from "./components/course_card.jsx";
import { Filter, X, Star, BookOpen, SlidersHorizontal } from "lucide-react";
import "./styles/findCourses.css";

const URL =
  import.meta.env.PROD === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

function FindCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estados principais
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Estados para opções de filtro
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [topics, setTopics] = useState([]);

  // Carregar categorias, áreas e tópicos
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesRes, topicsRes, areasRes] = await Promise.all([
          axios.get(`${URL}/api/categorias/com-areas`),
          axios.get(`${URL}/api/topicos/`),
          axios.get(`${URL}/api/areas/`),
        ]);

        setCategories(categoriesRes.data);
        setTopics(topicsRes.data);
        setAreas(areasRes.data);
        //console.log(areasRes.data);
      } catch (error) {
        console.error("Erro ao carregar opções de filtro:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Escutar mudanças nos parâmetros da URL
  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    const categoryFromUrl = searchParams.get("category") || "";
    const areaFromUrl = searchParams.get("area") || "";
    const topicFromUrl = searchParams.get("topic") || "";
    const difficultyFromUrl = searchParams.get("difficulty") || "";
    const typeFromUrl = searchParams.get("type") || "";
    const sortFromUrl = searchParams.get("sortBy") || "newest";

    // Atualizar estados se os valores da URL forem diferentes
    setSearchTerm(searchFromUrl);
    setSelectedCategory(categoryFromUrl);
    setSelectedArea(areaFromUrl);
    setSelectedTopic(topicFromUrl);
    setSelectedDifficulty(difficultyFromUrl);
    setSelectedType(typeFromUrl);
    setSortBy(sortFromUrl);
  }, [searchParams]);

  // Buscar cursos
  const fetchCourses = useCallback(
    async (resetPage = false) => {
      if (loading) return;

      setLoading(true);
      const currentPage = resetPage ? 1 : page;

      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: 12,
          search: searchTerm,
          category: selectedCategory,
          area: selectedArea,
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          type: selectedType,
          sortBy: sortBy,
        });

        const response = await axios.get(`${URL}/api/cursos/search?${params}`);
        const {
          courses: newCourses,
          totalCount,
          hasMore: morePages,
        } = response.data;

        if (resetPage) {
          setCourses(newCourses);
          setPage(2);
        } else {
          setCourses((prev) => [...prev, ...newCourses]);
          setPage((prev) => prev + 1);
        }

        setTotalCourses(totalCount);
        setHasMore(morePages);
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      searchTerm,
      selectedCategory,
      selectedArea,
      selectedTopic,
      selectedDifficulty,
      selectedType,
      sortBy,
      page,
      loading,
    ]
  );

  // Buscar cursos quando filtros mudarem
  useEffect(() => {
    fetchCourses(true);
  }, [
    searchTerm,
    selectedCategory,
    selectedArea,
    selectedTopic,
    selectedDifficulty,
    selectedType,
    sortBy,
  ]);

  useEffect(() => {
    // Só buscar se tiver pelo menos as categorias carregadas
    if (
      categories.length > 0 ||
      searchTerm ||
      selectedDifficulty ||
      selectedType
    ) {
      fetchCourses(true);
    }
  }, [
    searchTerm,
    selectedCategory,
    selectedArea,
    selectedTopic,
    selectedDifficulty,
    selectedType,
    sortBy,
    categories.length, // Adicionar isto para garantir que só pesquisa após carregar as opções
  ]);

  // Atualizar URL com parâmetros de pesquisa
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedArea) params.set("area", selectedArea);
    if (selectedTopic) params.set("topic", selectedTopic);
    if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
    if (selectedType) params.set("type", selectedType);
    if (sortBy !== "newest") params.set("sortBy", sortBy);

    setSearchParams(params);
  }, [
    searchTerm,
    selectedCategory,
    selectedArea,
    selectedTopic,
    selectedDifficulty,
    selectedType,
    sortBy,
    setSearchParams,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedArea("");
    setSelectedTopic("");
    setSelectedDifficulty("");
    setSelectedType("");
    setSortBy("newest");
    setSearchParams({});
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchCourses(false);
    }
  };

  const filteredAreas = selectedCategory
    ? areas.filter(
        (area) =>
          area.Categoria.ID_CATEGORIA__PK___ === parseInt(selectedCategory)
      )
    : areas;

  const filteredTopics = selectedArea
    ? topics.filter((topic) => topic.ID_AREA === parseInt(selectedArea))
    : topics;

  const hasActiveFilters =
    selectedCategory ||
    selectedArea ||
    selectedTopic ||
    selectedDifficulty ||
    selectedType ||
    searchTerm;

  return (
    <div className="find-courses-page">
      <Navbar />
      <div className="find-courses-container">
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar de filtros */}
            <div className="col-lg-2 col-md-2">
              <div className="find-courses-sidebar">
                <div className="find-courses-sidebar-header">
                  <h5 className="find-courses-sidebar-title">
                    <SlidersHorizontal size={20} className="me-2" />
                    Filtros
                  </h5>
                  {hasActiveFilters && (
                    <button
                      className="find-courses-clear-btn"
                      onClick={clearFilters}
                    >
                      Limpar tudo
                    </button>
                  )}
                </div>

                {/* Avaliação */}
                <div className="find-courses-filter-section">
                  <label className="find-courses-filter-label">Avaliação</label>
                  <div className="find-courses-rating-filters">
                    {[5, 4, 3].map((rating) => (
                      <div key={rating} className="find-courses-rating-item">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`find-courses-rating-${rating}`}
                        />
                        <label
                          className="find-courses-rating-label"
                          htmlFor={`find-courses-rating-${rating}`}
                        >
                          <div className="find-courses-stars">
                            {Array.from({ length: rating }, (_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill="#FFD700"
                                color="#FFD700"
                              />
                            ))}
                          </div>
                          <span className="find-courses-rating-text">
                            {rating} estrelas ou mais
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categoria */}
                <div className="find-courses-filter-section">
                  <label className="find-courses-filter-label">Categoria</label>
                  <select
                    className="find-courses-select"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedArea("");
                      setSelectedTopic("");
                    }}
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                      <option
                        key={category.ID_CATEGORIA__PK___}
                        value={category.ID_CATEGORIA__PK___}
                      >
                        {category.NOME__}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Área */}
                <div className="find-courses-filter-section">
                  <label className="find-courses-filter-label">Área</label>
                  <select
                    className="find-courses-select"
                    value={selectedArea}
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      setSelectedTopic("");
                    }}
                    disabled={!selectedCategory}
                  >
                    <option value="">Todas as áreas</option>
                    {filteredAreas.map((area) => (
                      <option key={area.ID_AREA} value={area.ID_AREA}>
                        {area.NOME}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tópico */}
                <div className="find-courses-filter-section">
                  <label className="find-courses-filter-label">Tópico</label>
                  <select
                    className="find-courses-select"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={!selectedArea}
                  >
                    <option value="">Todos os tópicos</option>
                    {filteredTopics.map((topic) => (
                      <option key={topic.ID_TOPICO} value={topic.ID_TOPICO}>
                        {topic.TITULO}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dificuldade */}
                <div className="find-courses-filter-section">
                  <label className="find-courses-filter-label">
                    Dificuldade
                  </label>
                  <div className="find-courses-difficulty-filters">
                    {["Iniciante", "Intermédio", "Difícil"].map(
                      (difficulty) => (
                        <div
                          key={difficulty}
                          className="find-courses-difficulty-item"
                        >
                          <input
                            className="form-check-input"
                            type="radio"
                            name="find-courses-difficulty"
                            id={`find-courses-difficulty-${difficulty}`}
                            checked={selectedDifficulty === difficulty}
                            onChange={() => setSelectedDifficulty(difficulty)}
                          />
                          <label
                            className="find-courses-difficulty-label"
                            htmlFor={`find-courses-difficulty-${difficulty}`}
                          >
                            {difficulty}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Tipo de curso */}
                <div className="find-courses-filter-section">
                  <label className="find-courses-filter-label">
                    Tipo de curso
                  </label>
                  <div className="find-courses-type-filters">
                    {[
                      { value: "assincrono", label: "Assíncrono" },
                      { value: "sincrono", label: "Síncrono" },
                    ].map((type) => (
                      <div key={type.value} className="find-courses-type-item">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="find-courses-courseType"
                          id={`find-courses-type-${type.value}`}
                          checked={selectedType === type.value}
                          onChange={() => setSelectedType(type.value)}
                        />
                        <label
                          className="find-courses-type-label"
                          htmlFor={`find-courses-type-${type.value}`}
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="col-lg-10 col-md-8">
              <div className="find-courses-content">
                {/* Header com resultados e ordenação */}
                <div className="find-courses-header">
                  <div className="find-courses-header-left">
                    <h2 className="find-courses-title">
                      {searchTerm
                        ? `Resultados para "${searchTerm}"`
                        : "Descobrir Cursos"}
                    </h2>
                    <p className="find-courses-subtitle">
                      {totalCourses}{" "}
                      {totalCourses === 1
                        ? "curso encontrado"
                        : "cursos encontrados"}
                    </p>
                  </div>
                  <div className="find-courses-sort-controls">
                    <select
                      className="find-courses-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Mais recentes</option>
                      <option value="oldest">Mais antigos</option>
                      <option value="name_asc">Nome A-Z</option>
                      <option value="name_desc">Nome Z-A</option>
                      <option value="difficulty_asc">
                        Dificuldade crescente
                      </option>
                      <option value="difficulty_desc">
                        Dificuldade decrescente
                      </option>
                    </select>
                  </div>
                </div>

                {/* Tags de filtros ativos */}
                {hasActiveFilters && (
                  <div className="find-courses-active-filters">
                    <div className="find-courses-filter-tags">
                      {searchTerm && (
                        <span className="find-courses-filter-tag find-courses-filter-tag-primary">
                          Pesquisa: {searchTerm}
                          <button
                            className="find-courses-filter-tag-close"
                            onClick={() => setSearchTerm("")}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {selectedCategory && (
                        <span className="find-courses-filter-tag find-courses-filter-tag-secondary">
                          Categoria:{" "}
                          {
                            categories.find(
                              (c) => c.ID_CATEGORIA__PK___ == selectedCategory
                            )?.NOME__
                          }
                          <button
                            className="find-courses-filter-tag-close"
                            onClick={() => {
                              setSelectedCategory("");
                              setSelectedArea("");
                              setSelectedTopic("");
                            }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {selectedArea && (
                        <span className="find-courses-filter-tag find-courses-filter-tag-warning">
                          Área:{" "}
                          {
                            areas.find((area) => area.ID_AREA == selectedArea)
                              ?.NOME
                          }
                          <button
                            className="find-courses-filter-tag-close"
                            onClick={() => {
                              setSelectedArea("");
                              setSelectedTopic("");
                            }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {selectedTopic && (
                        <span className="find-courses-filter-tag find-courses-filter-tag-dark">
                          Tópico:{" "}
                          {
                            topics.find(
                              (topic) => topic.ID_TOPICO == selectedTopic
                            )?.TITULO
                          }
                          <button
                            className="find-courses-filter-tag-close"
                            onClick={() => setSelectedTopic("")}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {selectedDifficulty && (
                        <span className="find-courses-filter-tag find-courses-filter-tag-info">
                          Dificuldade: {selectedDifficulty}
                          <button
                            className="find-courses-filter-tag-close"
                            onClick={() => setSelectedDifficulty("")}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {selectedType && (
                        <span className="find-courses-filter-tag find-courses-filter-tag-success">
                          Tipo:{" "}
                          {selectedType === "assincrono"
                            ? "Assíncrono"
                            : "Síncrono"}
                          <button
                            className="find-courses-filter-tag-close"
                            onClick={() => setSelectedType("")}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Loading indicator para lazy loading */}
                {loading && courses.length > 0 && (
                  <div className="find-courses-loading">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">A carregar...</span>
                    </div>
                  </div>
                )}

                {/* Grid de cursos */}
                <div className="find-courses-grid">
                  {courses.length === 0 && !loading ? (
                    <div className="find-courses-no-results">
                      <BookOpen
                        size={64}
                        className="find-courses-no-results-icon"
                      />
                      <h3 className="find-courses-no-results-title">
                        Nenhum curso encontrado
                      </h3>
                      <p className="find-courses-no-results-text">
                        Tente ajustar os filtros ou termos de pesquisa
                      </p>
                      <button
                        className="find-courses-no-results-btn"
                        onClick={clearFilters}
                      >
                        Ver todos os cursos
                      </button>
                    </div>
                  ) : (
                    courses.length > 0 && (
                      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                        {courses.map((course) => (
                          <div className="col" key={course.ID_CURSO}>
                            <CourseCard course={course} />
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* Botão carregar mais */}
                  {hasMore && courses.length > 0 && (
                    <div className="find-courses-load-more">
                      <button
                        className="find-courses-load-more-btn"
                        onClick={handleLoadMore}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            A carregar...
                          </>
                        ) : (
                          "Mostrar mais cursos"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default FindCoursesPage;
