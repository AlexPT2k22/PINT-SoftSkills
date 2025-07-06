import React, { useState, useEffect } from "react";
import axios from "axios";
import ErrorMessage from "./error_message";
import useAuthStore from "../store/authStore";
import {
  Star,
  Award,
  FileText,
  Calendar,
  BookOpen,
  Trophy,
} from "lucide-react";

const MeuPercursoFormativo = () => {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [avaliacoesFinais, setAvaliacoesFinais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  const { user } = useAuthStore();

  useEffect(() => {
    fetchMinhasAvaliacoesFinais();
  }, []);

  const fetchMinhasAvaliacoesFinais = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}/api/avaliacoes-finais/minhas`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      setAvaliacoesFinais(response.data);
      setError(null);
    } catch (error) {
      console.error("Erro ao buscar avaliações finais:", error);
      setError("Erro ao carregar o percurso formativo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getNotaColor = (nota) => {
    if (nota >= 16) return "success";
    if (nota >= 14) return "warning";
    if (nota >= 10) return "info";
    return "danger";
  };

  const getNotaStatus = (nota) => {
    if (nota >= 16) return "Excelente";
    if (nota >= 14) return "Bom";
    if (nota >= 10) return "Suficiente";
    return "Insuficiente";
  };

  const getNotaIcon = (nota) => {
    if (nota >= 16) return "🌟";
    if (nota >= 14) return "👍";
    if (nota >= 10) return "✅";
    return "❌";
  };

  const calcularEstatisticas = () => {
    if (avaliacoesFinais.length === 0) return null;

    const totalCursos = avaliacoesFinais.length;
    const cursosCompletados = avaliacoesFinais.filter(
      (av) => av.NOTA_FINAL >= 10
    ).length;
    const somaNotas = avaliacoesFinais.reduce(
      (sum, av) => sum + av.NOTA_FINAL,
      0
    );
    const mediaGeral = somaNotas / totalCursos;

    return {
      totalCursos,
      cursosCompletados,
      mediaGeral,
      taxaSucesso: (cursosCompletados / totalCursos) * 100,
    };
  };

  const estatisticas = calcularEstatisticas();

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">A carregar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onClose={() => setError(null)} />;
  }

  if (avaliacoesFinais.length === 0) {
    return (
      <div className="alert alert-info">
        <BookOpen size={20} className="me-2" />
        <strong>Percurso Formativo Vazio</strong>
        <p className="mb-0 mt-2">
          Ainda não possui avaliações finais de cursos completados. Quando
          terminar um curso, a avaliação final aparecerá aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="container p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <Trophy className="me-2" size={24} />
          Meu Percurso Formativo
        </h4>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="row mb-4">
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="text-primary">{estatisticas.totalCursos}</h2>
                <p className="mb-0">Cursos Avaliados</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="text-success">
                  {estatisticas.cursosCompletados}
                </h2>
                <p className="mb-0">Cursos Completados</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className={`text-${getNotaColor(estatisticas.mediaGeral)}`}>
                  {estatisticas.mediaGeral.toFixed(1)}
                </h2>
                <p className="mb-0">Média Geral</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="text-info">
                  {estatisticas.taxaSucesso.toFixed(0)}%
                </h2>
                <p className="mb-0">Taxa de Sucesso</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Avaliações */}
      <div className="row">
        {avaliacoesFinais.map((avaliacao) => (
          <div
            key={avaliacao.ID_AVALIACAO_FINAL_SINCRONA}
            className="col-md-6 mb-4"
          >
            <div className="card h-100 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <BookOpen size={16} className="me-1" />
                  {avaliacao.curso?.NOME || "Curso"}
                </h6>
                <span
                  className={`badge bg-${getNotaColor(avaliacao.NOTA_FINAL)}`}
                >
                  {avaliacao.NOTA_FINAL.toFixed(1)}/20
                </span>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="h5 me-2">
                      {getNotaIcon(avaliacao.NOTA_FINAL)}
                    </span>
                    <span
                      className={`fw-bold text-${getNotaColor(
                        avaliacao.NOTA_FINAL
                      )}`}
                    >
                      {getNotaStatus(avaliacao.NOTA_FINAL)}
                    </span>
                  </div>
                  <small className="text-muted">
                    <Calendar size={14} className="me-1" />
                    {new Date(avaliacao.DATA_AVALIACAO).toLocaleDateString()}
                  </small>
                </div>

                {avaliacao.curso?.DESCRICAO && (
                  <p className="text-muted small mb-3">
                    {avaliacao.curso.DESCRICAO.length > 100
                      ? avaliacao.curso.DESCRICAO.substring(0, 100) + "..."
                      : avaliacao.curso.DESCRICAO}
                  </p>
                )}

                {avaliacao.Formador && (
                  <div className="mb-3">
                    <small className="text-muted">Formador:</small>
                    <br />
                    <span className="fw-bold">
                      {avaliacao.Formador.NOME || avaliacao.Formador.USERNAME}
                    </span>
                  </div>
                )}

                {avaliacao.OBSERVACAO && (
                  <div className="mb-3">
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() =>
                        setExpandedCard(
                          expandedCard === avaliacao.ID_AVALIACAO_FINAL_SINCRONA
                            ? null
                            : avaliacao.ID_AVALIACAO_FINAL_SINCRONA
                        )
                      }
                    >
                      <FileText size={14} className="me-1" />
                      {expandedCard === avaliacao.ID_AVALIACAO_FINAL_SINCRONA
                        ? "Ocultar observações"
                        : "Ver observações"}
                    </button>

                    {expandedCard === avaliacao.ID_AVALIACAO_FINAL_SINCRONA && (
                      <div className="mt-2 p-2 bg-light rounded">
                        <small style={{ whiteSpace: "pre-wrap" }}>
                          {avaliacao.OBSERVACAO}
                        </small>
                      </div>
                    )}
                  </div>
                )}

                {avaliacao.NOTA_FINAL >= 10 && (
                  <div className="alert alert-success alert-sm p-2">
                    <Award size={16} className="me-1" />
                    <small>Curso completado com sucesso!</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Escala de Avaliação */}
      <div className="mt-4 p-3 bg-light rounded">
        <h6 className="text-muted mb-2">
          <Star size={16} className="me-1" />
          Escala de Avaliação
        </h6>
        <div className="row small">
          <div className="col-6 col-md-3">
            <span className="badge bg-success me-1">16-20</span>
            <span>Excelente</span>
          </div>
          <div className="col-6 col-md-3">
            <span className="badge bg-warning me-1">14-15</span>
            <span>Bom</span>
          </div>
          <div className="col-6 col-md-3">
            <span className="badge bg-info me-1">10-13</span>
            <span>Suficiente</span>
          </div>
          <div className="col-6 col-md-3">
            <span className="badge bg-danger me-1">0-9</span>
            <span>Insuficiente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeuPercursoFormativo;
