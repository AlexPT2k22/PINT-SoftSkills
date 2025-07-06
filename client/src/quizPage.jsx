import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Send,
} from "lucide-react";

function QuizPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Estados principais
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [hasResponse, setHasResponse] = useState(false);
  const [userResult, setUserResult] = useState(null);

  // Estados do quiz
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Buscar dados do quiz
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);

        // Buscar quiz do curso
        const quizResponse = await axios.get(
          `${URL}/api/quiz/curso/${courseId}`,
          { withCredentials: true }
        );

        if (quizResponse.data.hasQuiz) {
          setQuiz(quizResponse.data.quiz);
          setHasQuiz(true);
          setTimeLeft(quizResponse.data.quiz.TEMPO_LIMITE_MIN * 60); // Converter para segundos

          // Verificar se o usuário já respondeu
          try {
            const resultResponse = await axios.get(
              `${URL}/api/quiz/${quizResponse.data.quiz.ID_QUIZ}/resultado`,
              { withCredentials: true }
            );

            if (resultResponse.data.hasResponse) {
              setHasResponse(true);
              setUserResult(resultResponse.data);
            }
          } catch (resultError) {
            // Usuário ainda não respondeu - normal
            if (resultError.response?.status !== 404) {
              console.error("Erro ao buscar resultado:", resultError);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar quiz:", error);
        if (error.response?.status === 404) {
          setError("Este curso não possui um quiz disponível.");
        } else {
          setError("Erro ao carregar quiz. Tente novamente mais tarde.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchQuizData();
    }
  }, [courseId, URL]);

  // Timer do quiz
  useEffect(() => {
    let interval = null;

    if (quizStarted && !quizSubmitted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Tempo esgotado - submeter automaticamente
            handleSubmitQuiz();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quizStarted, quizSubmitted, timeLeft]);

  // Formatar tempo
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Iniciar quiz
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
  };

  // Selecionar resposta
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  // Navegar entre perguntas
  const goToQuestion = (questionIndex) => {
    if (questionIndex >= 0 && questionIndex < quiz.PERGUNTAS.length) {
      setCurrentQuestion(questionIndex);
    }
  };

  // Submeter quiz
  const handleSubmitQuiz = useCallback(async () => {
    if (submitting || quizSubmitted) return;

    try {
      setSubmitting(true);

      // Calcular tempo gasto
      const endTime = new Date();
      const timeSpent = startTime
        ? Math.floor((endTime - startTime) / 1000 / 60)
        : quiz.TEMPO_LIMITE_MIN;

      // Preparar respostas (array ordenado)
      const respostasArray = quiz.PERGUNTAS.map(
        (_, index) => answers[index] ?? -1
      );

      const response = await axios.post(
        `${URL}/api/quiz/${quiz.ID_QUIZ}/resposta`,
        {
          RESPOSTAS: respostasArray,
          TEMPO_GASTO_MIN: timeSpent,
        },
        { withCredentials: true }
      );

      setQuizSubmitted(true);
      setUserResult(response.data);
    } catch (error) {
      console.error("Erro ao submeter quiz:", error);
      setError("Erro ao submeter respostas. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }, [submitting, quizSubmitted, startTime, quiz, answers, URL]);

  // Verificar se todas as perguntas foram respondidas
  const allQuestionsAnswered = quiz
    ? quiz.PERGUNTAS.every((_, index) => answers[index] !== undefined)
    : false;

  if (loading) {
    return (
      <>
        <Navbar />
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="container mt-5">
          <div className="alert alert-danger text-center">
            <h4>Ops! Algo deu errado</h4>
            <p>{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/dashboard`)}
            >
              Ir para a dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!hasQuiz) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="container mt-5">
          <div className="alert alert-info text-center">
            <h4>Quiz não disponível</h4>
            <p>Este curso não possui um quiz no momento.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/dashboard`)}
            >
              Ir para a dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  // Se já respondeu, mostrar resultado
  if (hasResponse || quizSubmitted) {
    const result = userResult || {};

    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header text-center text-white">
                  <h3>Resultado do quiz</h3>
                  <h5 className="mb-0">{quiz.TITULO}</h5>
                </div>
                <div className="card-body text-center">
                  <div className="mb-4">
                    {result.passou ? (
                      <CheckCircle size={64} className="text-success mb-3" />
                    ) : (
                      <XCircle size={64} className="text-danger mb-3" />
                    )}

                    <h2
                      className={result.passou ? "text-success" : "text-danger"}
                    >
                      {((result.nota * 20) / 100).toFixed(1)} valores
                    </h2>

                    <p className="lead">
                      {result.passou ? "Parabéns!" : "Não foi desta vez..."}
                    </p>
                  </div>

                  <div className="row text-center mb-4 d-flex justify-content-center">
                    <div className="col-md-3">
                      <h6>Nota Obtida</h6>
                      <span className="h4">
                        {((result.nota * 20) / 100).toFixed(1)} valores
                      </span>
                    </div>
                    <div className="col-md-3">
                      <h6>Nota Mínima</h6>
                      <span className="h4">
                        {((result.notaMinima * 20) / 100).toFixed(1)} valores
                      </span>
                    </div>
                  </div>

                  {result.dataSubmissao && (
                    <p className="text-muted">
                      Submetido em:{" "}
                      {new Date(result.dataSubmissao).toLocaleString("pt-PT")}
                    </p>
                  )}

                  <div className="mt-4">
                    <button
                      className="btn btn-primary me-3"
                      onClick={() => navigate(`/dashboard`)}
                    >
                      Ir para a dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Tela inicial do quiz
  if (!quizStarted) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="container mt-4 p-4">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header text-center text-white">
                  <h3 className="mb-0">{quiz.TITULO}</h3>
                </div>
                <div className="card-body">
                  {quiz.DESCRICAO && (
                    <div className="mb-4">
                      <h5>Descrição:</h5>
                      <p>{quiz.DESCRICAO}</p>
                    </div>
                  )}

                  <div className="row mb-4">
                    <div className="col-md-4 text-center">
                      <Clock size={32} className="text-primary mb-2" />
                      <h6>Tempo Limite</h6>
                      <span>{quiz.TEMPO_LIMITE_MIN} minutos</span>
                    </div>
                    <div className="col-md-4 text-center">
                      <CheckCircle size={32} className="text-success mb-2" />
                      <h6>Nota Mínima</h6>
                      <span>
                        {((quiz.NOTA_MINIMA * 20) / 100).toFixed(1)} valores
                      </span>
                    </div>
                    <div className="col-md-4 text-center">
                      <div className="mb-2">
                        <strong style={{ fontSize: "32px" }}>
                          {quiz.PERGUNTAS.length}
                        </strong>
                      </div>
                      <h6>Perguntas</h6>
                    </div>
                  </div>

                  <div className="alert alert-warning">
                    <h6>Instruções:</h6>
                    <ul className="mb-0">
                      <li>
                        {quiz.TEMPO_LIMITE_MIN} minutos para completar o quiz
                      </li>
                      <li>Cada pergunta tem apenas uma resposta correta</li>
                      <li>É permitido navegar entre as perguntas</li>
                      <li>
                        O quiz será submetido automaticamente quando o tempo
                        esgotar
                      </li>
                      <li>Só é possivel fazer o quiz uma vez</li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleStartQuiz}
                    >
                      Iniciar quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Interface do quiz em andamento
  const currentQ = quiz.PERGUNTAS[currentQuestion];

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="container mt-4 p-4">
        <div className="row">
          <div className="col-md-9">
            {/* Header com progresso e timer */}
            <div className="card mb-3">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h5 className="mb-1">{quiz.TITULO}</h5>
                    <div className="progress" style={{ height: "8px" }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${
                            ((currentQuestion + 1) / quiz.PERGUNTAS.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <small className="text-muted">
                      Pergunta {currentQuestion + 1} de {quiz.PERGUNTAS.length}
                    </small>
                  </div>
                  <div className="col-md-6 text-end">
                    <div className="d-flex align-items-center justify-content-end">
                      <Clock size={20} className="me-2 text-primary" />
                      <span
                        className={`h5 mb-0 ${
                          timeLeft < 200 ? "text-danger" : "text-primary"
                        }`}
                      >
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    {timeLeft < 200 && (
                      <small className="text-danger">Tempo quase no fim!</small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pergunta atual */}
            <div className="card">
              <div className="card-body">
                <h4 className="mb-4">{currentQ.pergunta}</h4>

                <div className="list-group">
                  {currentQ.opcoes.map((opcao, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`list-group-item list-group-item-action ${
                        answers[currentQuestion] === index ? "active" : ""
                      }`}
                      onClick={() => handleAnswerSelect(currentQuestion, index)}
                    >
                      <div className="d-flex align-items-center">
                        <span className="me-3">
                          <strong>{String.fromCharCode(65 + index)}.</strong>
                        </span>
                        <span>{opcao}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navegação */}
            <div className="card mt-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => goToQuestion(currentQuestion - 1)}
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft size={16} className="me-1" />
                    Anterior
                  </button>

                  <span className="text-muted">
                    {Object.keys(answers).length} de {quiz.PERGUNTAS.length}{" "}
                    respondidas
                  </span>

                  {currentQuestion < quiz.PERGUNTAS.length - 1 ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => goToQuestion(currentQuestion + 1)}
                    >
                      Próxima
                      <ArrowRight size={16} className="ms-1" />
                    </button>
                  ) : (
                    <button
                      className="btn btn-success"
                      onClick={handleSubmitQuiz}
                      disabled={submitting || !allQuestionsAnswered}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          A submeter...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="me-1" />
                          Submeter quiz
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar com navegação rápida */}
          <div className="col-md-3">
            <div className="card sticky-top" style={{ top: "100px" }}>
              <div className="card-header">
                <h6 className="mb-0">Navegação Rápida</h6>
              </div>
              <div className="card-body">
                <div className="row g-2">
                  {quiz.PERGUNTAS.map((_, index) => (
                    <div key={index} className="col-3">
                      <button
                        className={`btn btn-sm w-100 ${
                          index === currentQuestion
                            ? "btn-primary"
                            : answers[index] !== undefined
                            ? "btn-success"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => goToQuestion(index)}
                      >
                        {index + 1}
                      </button>
                    </div>
                  ))}
                </div>

                <hr />

                <div className="text-center">
                  <div className="mb-2">
                    <span className="badge bg-success me-1">●</span>
                    <small>Respondida</small>
                  </div>
                  <div className="mb-2">
                    <span className="badge bg-primary me-1">●</span>
                    <small>Atual</small>
                  </div>
                  <div className="mb-3">
                    <span className="badge bg-secondary me-1">●</span>
                    <small>Não respondida</small>
                  </div>

                  {allQuestionsAnswered && (
                    <button
                      className="btn btn-success btn-sm w-100"
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" />
                          A submeter...
                        </>
                      ) : (
                        <>
                          <Send size={14} className="me-1" />
                          Finalizar quiz
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuizPage;
