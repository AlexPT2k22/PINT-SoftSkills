import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  BarChart3,
  CheckCircle,
  Eye,
  Lock,
} from "lucide-react";
import SuccessMessage from "./sucess_message";
import ErrorMessage from "./error_message";

const QuizManager = ({ courseId, courseType, userRole }) => {
  const [quiz, setQuiz] = useState(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showReadOnly, setShowReadOnly] = useState(false);
  const [hasResponses, setHasResponses] = useState(false);
  const [quizForm, setQuizForm] = useState({
    titulo: "",
    descricao: "",
    perguntas: [
      {
        pergunta: "",
        opcoes: ["", ""],
        resposta_correta: 0,
      },
    ],
    tempo_limite_min: 30,
    nota_minima: 9.5,
  });

  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (courseType === "Assíncrono") {
      fetchQuiz();
    }
  }, [courseId, courseType]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}/api/quiz/curso/${courseId}`, {
        withCredentials: true,
      });

      if (response.data.hasQuiz) {
        setQuiz(response.data.quiz);
        setHasQuiz(true);
      }

      try {
        const statsResponse = await axios.get(
          `${URL}/api/quiz/${response.data.quiz.ID_QUIZ}/stats`,
          { withCredentials: true }
        );
        setHasResponses(statsResponse.data.totalRespostas > 0);
      } catch (error) {
        setHasResponses(false);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Erro ao procurar o quiz:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const showQuizReadOnly = () => {
    setShowReadOnly(true);
  };

  const showQuizEdit = () => {
    if (hasResponses) {
      setError(
        "Não é possível editar o quiz porque já existem respostas submetidas."
      );
      return;
    }

    setQuizForm({
      titulo: quiz.TITULO,
      descricao: quiz.DESCRICAO,
      perguntas: quiz.PERGUNTAS,
      tempo_limite_min: quiz.TEMPO_LIMITE_MIN,
      nota_minima: (quiz.NOTA_MINIMA * 20) / 100,
    });
    setShowCreateForm(true);
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${URL}/api/quiz/${quiz.ID_QUIZ}/stats`,
        { withCredentials: true }
      );
      setStats(response.data);
      setShowStats(true);
    } catch (error) {
      console.error("Erro ao procurar as estatísticas:", error);
    }
  };

  const addPergunta = () => {
    setQuizForm({
      ...quizForm,
      perguntas: [
        ...quizForm.perguntas,
        {
          pergunta: "",
          opcoes: ["", ""],
          resposta_correta: 0,
        },
      ],
    });
  };

  const updatePergunta = (index, field, value) => {
    const newPerguntas = [...quizForm.perguntas];
    newPerguntas[index][field] = value;
    setQuizForm({ ...quizForm, perguntas: newPerguntas });
  };

  const addOpcao = (perguntaIndex) => {
    const newPerguntas = [...quizForm.perguntas];
    newPerguntas[perguntaIndex].opcoes.push("");
    setQuizForm({ ...quizForm, perguntas: newPerguntas });
  };

  const updateOpcao = (perguntaIndex, opcaoIndex, value) => {
    const newPerguntas = [...quizForm.perguntas];
    newPerguntas[perguntaIndex].opcoes[opcaoIndex] = value;
    setQuizForm({ ...quizForm, perguntas: newPerguntas });
  };

  const removeOpcao = (perguntaIndex, opcaoIndex) => {
    const newPerguntas = [...quizForm.perguntas];
    if (newPerguntas[perguntaIndex].opcoes.length > 2) {
      newPerguntas[perguntaIndex].opcoes.splice(opcaoIndex, 1);
      if (newPerguntas[perguntaIndex].resposta_correta >= opcaoIndex) {
        newPerguntas[perguntaIndex].resposta_correta = Math.max(
          0,
          newPerguntas[perguntaIndex].resposta_correta - 1
        );
      }
      setQuizForm({ ...quizForm, perguntas: newPerguntas });
    }
  };

  const removePergunta = (index) => {
    if (quizForm.perguntas.length > 1) {
      const newPerguntas = quizForm.perguntas.filter((_, i) => i !== index);
      setQuizForm({ ...quizForm, perguntas: newPerguntas });
    }
  };

  const validateQuizForm = () => {
    const errors = {};

    if (!quizForm.titulo.trim()) {
      errors.titulo = "O título do quiz é obrigatório";
    }

    if (
      !quizForm.tempo_limite_min ||
      quizForm.tempo_limite_min < 5 ||
      quizForm.tempo_limite_min > 180
    ) {
      errors.tempo_limite_min =
        "O tempo limite deve estar entre 5 e 180 minutos";
    }

    if (quizForm.nota_minima < 0 || quizForm.nota_minima > 20) {
      errors.nota_minima = "A nota mínima deve estar entre 0 e 20";
    }

    quizForm.perguntas.forEach((pergunta, pIndex) => {
      if (!pergunta.pergunta.trim()) {
        errors[`pergunta_${pIndex}`] = `A pergunta ${
          pIndex + 1
        } não pode estar vazia`;
      }

      const opcoesVazias = pergunta.opcoes.filter(
        (opcao) => !opcao.trim()
      ).length;
      if (opcoesVazias > 0) {
        errors[`opcoes_${pIndex}`] = `Todas as opções da pergunta ${
          pIndex + 1
        } devem ser preenchidas`;
      }

      if (pergunta.opcoes.length < 2) {
        errors[`opcoes_min_${pIndex}`] = `A pergunta ${
          pIndex + 1
        } deve ter pelo menos 2 opções`;
      }
    });

    if (quizForm.perguntas.length === 0) {
      errors.perguntas_geral = "O quiz deve ter pelo menos uma pergunta";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitQuiz = async () => {
    setValidationErrors({});

    if (!validateQuizForm()) {
      setError("Por favor, corrija os erros indicados antes de continuar");
      return;
    }

    try {
      const quizData = {
        ID_CURSO: courseId,
        TITULO: quizForm.titulo.trim(),
        DESCRICAO: quizForm.descricao.trim(), // Descrição pode ficar vazia
        PERGUNTAS: quizForm.perguntas.map((pergunta) => ({
          pergunta: pergunta.pergunta.trim(),
          opcoes: pergunta.opcoes.map((opcao) => opcao.trim()),
          resposta_correta: pergunta.resposta_correta,
        })),
        TEMPO_LIMITE_MIN: quizForm.tempo_limite_min,
        NOTA_MINIMA: quizForm.nota_minima,
      };

      if (hasQuiz) {
        await axios.put(`${URL}/api/quiz/${quiz.ID_QUIZ}`, quizData, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${URL}/api/quiz`, quizData, {
          withCredentials: true,
        });
      }

      setShowCreateForm(false);
      setValidationErrors({});
      fetchQuiz();
      setSuccess(
        hasQuiz ? "Quiz atualizado com sucesso!" : "Quiz criado com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao guardar quiz:", error);
      setError(
        hasQuiz
          ? "Erro ao atualizar quiz. Verifique os dados e tente novamente."
          : "Erro ao criar quiz. Verifique os dados e tente novamente."
      );
    }
  };

  const deleteQuiz = async () => {
    if (confirm("Tem certeza que deseja apagar este quiz?")) {
      try {
        await axios.delete(`${URL}/api/quiz/${quiz.ID_QUIZ}`, {
          withCredentials: true,
        });
        setQuiz(null);
        setHasQuiz(false);
        setHasResponses(false);
        setSuccess("Quiz apagado com sucesso!");
      } catch (error) {
        console.error("Erro ao apagar quiz:", error);
        setError("Erro ao apagar quiz. Tente novamente mais tarde.");
      }
    }
  };

  if (courseType !== "Assíncrono" || userRole !== true) {
    return null;
  }

  if (loading) {
    return <div className="text-center">A carregar quiz...</div>;
  }

  return (
    <>
      <div className="container ">
        {success && (
          <SuccessMessage message={success} onClose={() => setSuccess(null)} />
        )}
        {error && (
          <ErrorMessage message={error} onClose={() => setError(null)} />
        )}
      </div>
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Quiz do curso</h5>
        </div>
        <div className="card-body">
          {!hasQuiz ? (
            <div className="text-center">
              <p className="text-muted">Este curso ainda não possui quiz.</p>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus size={16} className="me-2" />
                Criar quiz
              </button>
            </div>
          ) : (
            <div>
              <div className="d-flex justify-content-between align-items-start mb-0">
                <div>
                  <h6>{quiz.TITULO}</h6>
                  <p className="text-muted mb-0">{quiz.DESCRICAO}</p>
                  <small className="text-info">
                    <CheckCircle size={14} className="me-1" />
                    Nota mínima: {((quiz.NOTA_MINIMA * 20) / 100).toFixed(1)}/20
                    | Tempo: {quiz.TEMPO_LIMITE_MIN} min
                  </small>
                  {hasResponses && (
                    <small className="text-warning ms-2">
                      <Lock size={14} className="me-1" />
                      Quiz com respostas (apenas leitura)
                    </small>
                  )}
                </div>
                <div className="d-flex gap-1">
                  {hasResponses ? (
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={showQuizReadOnly}
                      type="button"
                      title="Visualizar quiz (modo leitura)"
                    >
                      <Eye size={14} />
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={showQuizEdit}
                      type="button"
                      title="Editar quiz"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={fetchStats}
                    type="button"
                  >
                    <BarChart3 size={14} />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={deleteQuiz}
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {showReadOnly && (
            <div className="modal show d-block" tabIndex="-1">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header text-white">
                    <h5 className="modal-title">
                      Visualizar quiz (modo leitura)
                    </h5>
                    <button
                      className="btn-close btn-close-white"
                      onClick={() => setShowReadOnly(false)}
                      type="button"
                    ></button>
                  </div>
                  <div
                    className="modal-body"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    <div className="alert alert-warning">
                      <Lock size={16} className="me-2" />
                      <strong>Quiz bloqueado para edição:</strong> Este quiz já
                      possui respostas submetidas e não pode ser editado.
                      Utilize este modo apenas para visualização.
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-8">
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            Título do quiz
                          </label>
                          <div className="form-control-plaintext border rounded p-2 bg-light">
                            {quiz.TITULO}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            Descrição
                          </label>
                          <div className="form-control-plaintext border rounded p-2 bg-light">
                            {quiz.DESCRICAO || "Sem descrição"}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            Tempo limite
                          </label>
                          <div className="form-control-plaintext border rounded p-2 bg-light">
                            {quiz.TEMPO_LIMITE_MIN} minutos
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            Nota mínima
                          </label>
                          <div className="form-control-plaintext border rounded p-2 bg-light">
                            {((quiz.NOTA_MINIMA * 20) / 100).toFixed(1)}/20
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Perguntas ({quiz.PERGUNTAS.length})
                      </label>

                      {quiz.PERGUNTAS.map((pergunta, pIndex) => (
                        <div
                          key={pIndex}
                          className="card mb-3 border-secondary"
                        >
                          <div className="card-body">
                            <div className="mb-3">
                              <h6 className="text-primary">
                                Pergunta {pIndex + 1}
                              </h6>
                              <div className="border rounded p-3 bg-light">
                                {pergunta.pergunta}
                              </div>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted fw-bold">
                                Opções de resposta:
                              </small>
                            </div>

                            {pergunta.opcoes.map((opcao, oIndex) => (
                              <div key={oIndex} className="input-group mb-2">
                                <div className="input-group-text">
                                  <span
                                    className={`badge ${
                                      pergunta.resposta_correta === oIndex
                                        ? "bg-success"
                                        : "bg-secondary"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIndex)}
                                  </span>
                                </div>
                                <div
                                  className={`form-control ${
                                    pergunta.resposta_correta === oIndex
                                      ? "bg-success bg-opacity-10 border-success"
                                      : "bg-light"
                                  }`}
                                >
                                  {opcao}
                                  {pergunta.resposta_correta === oIndex && (
                                    <span className="text-success fw-bold ms-2">
                                      (Resposta correta)
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="alert alert-info">
                      <h6>Informações do quiz:</h6>
                      <ul className="mb-0">
                        <li>
                          <strong>Total de perguntas:</strong>{" "}
                          {quiz.PERGUNTAS.length}
                        </li>
                        <li>
                          <strong>Tempo limite:</strong> {quiz.TEMPO_LIMITE_MIN}{" "}
                          minutos
                        </li>
                        <li>
                          <strong>Nota mínima para aprovação:</strong>{" "}
                          {((quiz.NOTA_MINIMA * 20) / 100).toFixed(1)}/20
                        </li>
                        <li>
                          <strong>Status:</strong>{" "}
                          {quiz.ATIVO ? "Ativo" : "Inativo"}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowReadOnly(false)}
                      type="button"
                    >
                      Fechar
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowReadOnly(false);
                        fetchStats();
                      }}
                      type="button"
                    >
                      <BarChart3 size={16} className="me-2" />
                      Ver estatísticas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showCreateForm && (
            <div className="modal show d-block" tabIndex="-1">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {hasQuiz ? "Editar Quiz" : "Criar Quiz"}
                    </h5>
                    <button
                      className="btn-close"
                      onClick={() => {
                        setShowCreateForm(false);
                        setValidationErrors({});
                      }}
                      type="button"
                    ></button>
                  </div>
                  <div
                    className="modal-body"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    {Object.keys(validationErrors).length > 0 && (
                      <div className="alert alert-danger">
                        <h6>Corrija os seguintes erros:</h6>
                        <ul className="mb-0">
                          {Object.values(validationErrors).map(
                            (error, index) => (
                              <li key={index}>{error}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="row mb-3">
                      <div className="col-md-8">
                        <label className="form-label">
                          Título do quiz <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${
                            validationErrors.titulo ? "is-invalid" : ""
                          }`}
                          value={quizForm.titulo}
                          onChange={(e) =>
                            setQuizForm({ ...quizForm, titulo: e.target.value })
                          }
                          placeholder="Ex: Avaliação Final"
                          maxLength="255"
                        />
                        {validationErrors.titulo && (
                          <div className="invalid-feedback">
                            {validationErrors.titulo}
                          </div>
                        )}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">
                          Tempo limite (min){" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${
                            validationErrors.tempo_limite_min
                              ? "is-invalid"
                              : ""
                          }`}
                          value={quizForm.tempo_limite_min}
                          onChange={(e) =>
                            setQuizForm({
                              ...quizForm,
                              tempo_limite_min: parseInt(e.target.value) || 0,
                            })
                          }
                          min="5"
                          max="180"
                        />
                        {validationErrors.tempo_limite_min && (
                          <div className="invalid-feedback">
                            {validationErrors.tempo_limite_min}
                          </div>
                        )}
                        <small className="form-text text-muted">
                          Entre 5 e 180 minutos
                        </small>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-8">
                        <label className="form-label">
                          Descrição (opcional)
                        </label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={quizForm.descricao}
                          onChange={(e) =>
                            setQuizForm({
                              ...quizForm,
                              descricao: e.target.value,
                            })
                          }
                          placeholder="Descrição do quiz..."
                          maxLength="500"
                        />
                        <small className="form-text text-muted">
                          {quizForm.descricao.length}/500 caracteres
                        </small>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">
                          Nota mínima (escala 0-20){" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${
                            validationErrors.nota_minima ? "is-invalid" : ""
                          }`}
                          value={quizForm.nota_minima}
                          onChange={(e) =>
                            setQuizForm({
                              ...quizForm,
                              nota_minima: parseFloat(e.target.value) || 0,
                            })
                          }
                          min="0"
                          max="20"
                          step="0.1"
                          disabled={true}
                        />
                        {validationErrors.nota_minima && (
                          <div className="invalid-feedback">
                            {validationErrors.nota_minima}
                          </div>
                        )}
                        <small className="form-text text-muted">
                          Entre 0 e 20 valores
                        </small>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label">
                          Perguntas <span className="text-danger">*</span>
                        </label>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={addPergunta}
                        >
                          <Plus size={14} className="me-1" />
                          Adicionar pergunta
                        </button>
                      </div>

                      {quizForm.perguntas.map((pergunta, pIndex) => (
                        <div key={pIndex} className="card mb-3">
                          <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                              <h6>Pergunta {pIndex + 1}</h6>
                              {quizForm.perguntas.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => removePergunta(pIndex)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>

                            <div className="mb-3">
                              <input
                                type="text"
                                className={`form-control ${
                                  validationErrors[`pergunta_${pIndex}`]
                                    ? "is-invalid"
                                    : ""
                                }`}
                                placeholder="Digite a pergunta... *"
                                value={pergunta.pergunta}
                                onChange={(e) =>
                                  updatePergunta(
                                    pIndex,
                                    "pergunta",
                                    e.target.value
                                  )
                                }
                                maxLength="500"
                              />
                              {validationErrors[`pergunta_${pIndex}`] && (
                                <div className="invalid-feedback">
                                  {validationErrors[`pergunta_${pIndex}`]}
                                </div>
                              )}
                            </div>

                            <div className="mb-2">
                              <small className="text-muted">
                                Opções de resposta{" "}
                                <span className="text-danger">*</span>
                                {validationErrors[`opcoes_${pIndex}`] && (
                                  <span className="text-danger ms-2">
                                    - {validationErrors[`opcoes_${pIndex}`]}
                                  </span>
                                )}
                                {validationErrors[`opcoes_min_${pIndex}`] && (
                                  <span className="text-danger ms-2">
                                    - {validationErrors[`opcoes_min_${pIndex}`]}
                                  </span>
                                )}
                              </small>
                            </div>

                            {pergunta.opcoes.map((opcao, oIndex) => (
                              <div key={oIndex} className="input-group mb-2">
                                <div className="input-group-text">
                                  <input
                                    type="radio"
                                    name={`pergunta_${pIndex}`}
                                    checked={
                                      pergunta.resposta_correta === oIndex
                                    }
                                    onChange={() =>
                                      updatePergunta(
                                        pIndex,
                                        "resposta_correta",
                                        oIndex
                                      )
                                    }
                                  />
                                </div>
                                <input
                                  type="text"
                                  className={`form-control ${
                                    validationErrors[`opcoes_${pIndex}`] &&
                                    !opcao.trim()
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  placeholder={`Opção ${oIndex + 1} *`}
                                  value={opcao}
                                  onChange={(e) =>
                                    updateOpcao(pIndex, oIndex, e.target.value)
                                  }
                                  maxLength="200"
                                />
                                {pergunta.opcoes.length > 2 && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() => removeOpcao(pIndex, oIndex)}
                                    title="Remover opção"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            ))}

                            <div className="d-flex justify-content-between align-items-center">
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => addOpcao(pIndex)}
                                disabled={pergunta.opcoes.length >= 6}
                              >
                                <Plus size={14} className="me-1" />
                                Adicionar opção
                              </button>
                              <small className="text-muted">
                                Marque a opção da resposta correta •{" "}
                                {pergunta.opcoes.length}/6 opções
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="alert alert-info">
                      <h6>Avisos importantes:</h6>
                      <ul className="mb-0">
                        <li>
                          Campos marcados com{" "}
                          <span className="text-danger">*</span> são
                          obrigatórios
                        </li>
                        <li>A descrição é opcional e pode ficar em branco</li>
                        <li>A nota mínima deve estar entre 0 e 20</li>
                        <li>O tempo limite deve estar entre 5 e 180 minutos</li>
                        <li>
                          Cada pergunta deve ter pelo menos 2 opções preenchidas
                        </li>
                        <li>
                          Não se esqueça de marcar a resposta correta para cada
                          pergunta
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCreateForm(false);
                        setValidationErrors({});
                      }}
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={submitQuiz}
                    >
                      {hasQuiz ? "Atualizar" : "Criar"} Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showStats && stats && (
            <div className="modal show d-block" tabIndex="-1">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Estatísticas do quiz</h5>
                    <button
                      className="btn-close"
                      onClick={() => setShowStats(false)}
                      type="button"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row mb-4">
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-primary">
                            {stats.totalRespostas}
                          </h4>
                          <small>Total de respostas</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-success">{stats.aprovados}</h4>
                          <small>Aprovados</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-danger">{stats.reprovados}</h4>
                          <small>Reprovados</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-info">
                            {((stats.notaMedia * 20) / 100).toFixed(1)}/20
                          </h4>
                          <small>Nota média</small>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="progress">
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${stats.taxaAprovacao}%` }}
                        >
                          {stats.taxaAprovacao.toFixed(1)}% Taxa de aprovação
                        </div>
                      </div>
                    </div>

                    {stats.respostas.length > 0 && (
                      <div>
                        <h6>Respostas individuais:</h6>
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Utilizador</th>
                                <th>Nota</th>
                                <th>Status</th>
                                <th>Data</th>
                                <th>Tempo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.respostas.map((resposta, index) => (
                                <tr key={index}>
                                  <td>{resposta.utilizador}</td>
                                  <td>
                                    {((resposta.nota * 20) / 100).toFixed(1)}/20
                                  </td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        resposta.passou
                                          ? "bg-success"
                                          : "bg-danger"
                                      }`}
                                    >
                                      {resposta.passou
                                        ? "Aprovado"
                                        : "Reprovado"}
                                    </span>
                                  </td>
                                  <td>
                                    {new Date(
                                      resposta.dataSubmissao
                                    ).toLocaleDateString()}
                                  </td>
                                  <td>{resposta.tempoGasto || "1"} min</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowStats(false)}
                      type="button"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuizManager;
