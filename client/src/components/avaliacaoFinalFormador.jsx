import React, { useState, useEffect } from "react";
import axios from "axios";
import ErrorMessage from "./error_message";
import useAuthStore from "../store/authStore";
import { Star, Save, Eye, FileText } from "lucide-react";

const AvaliacaoFinalFormador = ({ cursoId }) => {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    fetchAvaliacoesFinais();
  }, [cursoId]);

  const fetchAvaliacoesFinais = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${URL}/api/avaliacoes-finais/curso/${cursoId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setAvaliacoes(response.data);
      setError(null);
    } catch (error) {
      console.error("Erro ao buscar avaliações finais:", error);
      setError("Erro ao carregar avaliações finais. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarAvaliacao = async (alunoId, notaFinal, observacao) => {
    try {
      setSaving(true);
      await axios.post(
        `${URL}/api/avaliacoes-finais/curso/${cursoId}/aluno/${alunoId}`,
        {
          notaFinal: parseFloat(notaFinal),
          observacao: observacao,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await fetchAvaliacoesFinais();
      setEditingId(null);
      setError(null);
    } catch (error) {
      console.error("Erro ao salvar avaliação final:", error);
      setError("Erro ao salvar avaliação final. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const getNotaColor = (nota) => {
    if (nota >= 16) return "text-success";
    if (nota >= 14) return "text-warning";
    if (nota >= 10) return "text-info";
    return "text-danger";
  };

  const getNotaStatus = (nota) => {
    if (nota >= 16) return "Excelente";
    if (nota >= 14) return "Bom";
    if (nota >= 10) return "Suficiente";
    return "Insuficiente";
  };

  return (
    <div className="container p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <Star className="me-2" size={20} />
          Avaliações Finais do Curso
        </h4>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="d-flex justify-content-center my-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">A carregar...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {avaliacoes.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">
                <FileText size={20} className="me-2" />
                Ainda não há alunos inscritos neste curso.
              </div>
            </div>
          ) : (
            avaliacoes.map((avaliacao) => (
              <div
                key={avaliacao.aluno.ID_UTILIZADOR}
                className="col-md-6 mb-4"
              >
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      {avaliacao.aluno.NOME || avaliacao.aluno.USERNAME}
                    </h6>
                    {avaliacao.avaliacaoFinal && (
                      <span
                        className={`badge ${
                          avaliacao.avaliacaoFinal.NOTA_FINAL >= 10
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {avaliacao.avaliacaoFinal.NOTA_FINAL.toFixed(1)}/20
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    {editingId === avaliacao.aluno.ID_UTILIZADOR ? (
                      <EditarAvaliacaoForm
                        avaliacao={avaliacao}
                        onSave={handleSalvarAvaliacao}
                        onCancel={() => setEditingId(null)}
                        saving={saving}
                      />
                    ) : (
                      <VisualizarAvaliacao
                        avaliacao={avaliacao}
                        onEdit={() =>
                          setEditingId(avaliacao.aluno.ID_UTILIZADOR)
                        }
                        getNotaColor={getNotaColor}
                        getNotaStatus={getNotaStatus}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const EditarAvaliacaoForm = ({ avaliacao, onSave, onCancel, saving }) => {
  const [nota, setNota] = useState(
    avaliacao.avaliacaoFinal?.NOTA_FINAL?.toString() || ""
  );
  const [observacao, setObservacao] = useState(
    avaliacao.avaliacaoFinal?.OBSERVACAO || ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nota && parseFloat(nota) >= 0 && parseFloat(nota) <= 20) {
      onSave(avaliacao.aluno.ID_UTILIZADOR, nota, observacao);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">
          <strong>Nota Final (0-20)</strong>
        </label>
        <input
          type="number"
          className="form-control"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          min="0"
          max="20"
          step="0.1"
          required
          disabled={saving}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">
          <strong>Observações</strong>
        </label>
        <textarea
          className="form-control"
          rows="3"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Comentários sobre o desempenho do aluno..."
          disabled={saving}
        />
      </div>
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={saving || !nota}
        >
          {saving ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              A guardar...
            </>
          ) : (
            <>
              <Save size={16} className="me-1" />
              Guardar
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const VisualizarAvaliacao = ({
  avaliacao,
  onEdit,
  getNotaColor,
  getNotaStatus,
}) => {
  const hasAvaliacao = avaliacao.avaliacaoFinal;

  return (
    <div>
      <div className="mb-3">
        <small className="text-muted">Email:</small>
        <br />
        <span>{avaliacao.aluno.EMAIL}</span>
      </div>

      {hasAvaliacao ? (
        <div>
          <div className="mb-3">
            <small className="text-muted">Nota Final:</small>
            <br />
            <span className={`h5 ${getNotaColor(hasAvaliacao.NOTA_FINAL)}`}>
              {hasAvaliacao.NOTA_FINAL.toFixed(1)}/20
            </span>
            <small className="ms-2 text-muted">
              ({getNotaStatus(hasAvaliacao.NOTA_FINAL)})
            </small>
          </div>

          {hasAvaliacao.OBSERVACAO && (
            <div className="mb-3">
              <small className="text-muted">Observações:</small>
              <p className="mb-0">{hasAvaliacao.OBSERVACAO}</p>
            </div>
          )}

          <div className="mb-3">
            <small className="text-muted">Data de Avaliação:</small>
            <br />
            <span>
              {new Date(hasAvaliacao.DATA_AVALIACAO).toLocaleDateString()}
            </span>
          </div>

          <button className="btn btn-outline-primary btn-sm" onClick={onEdit}>
            <Eye size={16} className="me-1" />
            Editar Avaliação
          </button>
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-muted mb-3">Ainda não avaliado</p>
          <button className="btn btn-primary btn-sm" onClick={onEdit}>
            <Star size={16} className="me-1" />
            Avaliar Aluno
          </button>
        </div>
      )}
    </div>
  );
};

export default AvaliacaoFinalFormador;
