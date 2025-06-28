import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Search,
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import Navbar from "./components/navbar";
import "./styles/verifyCertificate.css";

function VerifyCertificate() {
  const { certificateId } = useParams();
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [codigo, setCodigo] = useState("");
  const [certificado, setCertificado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  // Check if there's a code in URL on component mount
  useEffect(() => {
    const codeFromUrl = certificateId;
    if (codeFromUrl) {
      setCodigo(codeFromUrl.toUpperCase());
      handleVerificarWithCode(codeFromUrl);
    }
  }, [certificateId]);

  const handleVerificarWithCode = async (code) => {
    try {
      setIsLoading(true);
      setError(null);
      setCertificado(null);
      setIsVerified(false);

      const response = await axios.get(
        `${URL}/api/certificados/verificar/${code.trim()}`
      );

      if (response.data.success) {
        setCertificado(response.data.certificado);
        setIsVerified(true);
      }
    } catch (error) {
      console.error("Erro ao verificar certificado:", error);
      setError(
        error.response?.data?.message || "Erro ao verificar certificado"
      );
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificar = async (e) => {
    e.preventDefault();

    if (!codigo.trim()) {
      setError("Por favor, insira um código de verificação");
      return;
    }

    await handleVerificarWithCode(codigo);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatGrade = (grade) => {
    if (!grade) return "N/A";
    return `${grade}/20`;
  };

  const getGradeColor = (grade) => {
    if (!grade) return "text-muted";
    if (grade >= 16) return "text-success";
    if (grade >= 14) return "text-primary";
    if (grade >= 10) return "text-warning";
    return "text-danger";
  };

  const handleReset = () => {
    setCodigo("");
    setCertificado(null);
    setError(null);
    setIsVerified(false);
    // Clear URL parameters
    window.history.pushState({}, "", "/verificar-certificado");
  };

  return (
    <div className="verify-certificate-page">
      <Navbar />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="verification-card card shadow-lg border-0">
              {/* Header */}
              <div className="card-header text-center text-white">
                <Award size={48} className="mb-3" color="#39639c" />
                <h1 className="h2 mb-3 fw-bold titulo">
                  Verificação de Certificado
                </h1>
                <p className="mb-0 ">
                  {certificateId
                    ? "A verificar o certificado automaticamente..."
                    : "Insira o código de verificação para confirmar a autenticidade do certificado"}
                </p>
              </div>

              {/* Body */}
              <div className="card-body p-4 p-md-5">
                {/* Search Form - Hide if URL has code */}
                {!certificateId && (
                  <form onSubmit={handleVerificar} className="mb-4">
                    <div className="input-group input-group-lg verification-input">
                      <span className="input-group-text bg-light border-end-0">
                        <Search size={20} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 border-end-0"
                        placeholder="Digite o código (ex: A1B2C3D4E5F6G7H8)"
                        value={codigo}
                        onChange={(e) =>
                          setCodigo(e.target.value.toUpperCase())
                        }
                        maxLength={16}
                        required
                      />
                      <button
                        className="btn btn-primary px-4"
                        type="submit"
                        disabled={isLoading || !codigo.trim()}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Verificando...
                          </>
                        ) : (
                          <>
                            <Search size={18} className="me-2" />
                            Verificar
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border text-primary mb-3"
                      role="status"
                    >
                      <span className="visually-hidden">A carregar...</span>
                    </div>
                    <p className="text-muted">A verificar o certificado...</p>
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger border-0 d-flex align-items-center">
                    <XCircle size={24} className="me-3 flex-shrink-0" />
                    <div>
                      <h6 className="mb-0 text-white">
                        Certificado não encontrado!
                      </h6>
                    </div>
                  </div>
                )}

                {/* Success Result */}
                {isVerified && certificado && (
                  <div className="verification-result">
                    {/* Success Alert */}
                    <div className="alert alert-success border-0 d-flex align-items-center mb-4">
                      <CheckCircle size={24} className="me-3 flex-shrink-0" />
                      <div>
                        <h6 className="mb-0 text-white">
                          Certificado Autêntico!
                        </h6>
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="certificate-details">
                      <h4 className="text-center mb-4 fw-bold">
                        Detalhes do Certificado
                      </h4>

                      <div className="row g-3">
                        {/* Student Name */}
                        <div className="col-md-6">
                          <div className="detail-card card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center">
                              <div className="detail-icon me-3">
                                <User size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <small className="detail-label">Aluno</small>
                                <div className="detail-value">
                                  {certificado.aluno}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Course Name */}
                        <div className="col-md-6">
                          <div className="detail-card card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center">
                              <div className="detail-icon me-3">
                                <BookOpen size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <small className="detail-label">Curso</small>
                                <div className="detail-value">
                                  {certificado.curso}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Completion Date */}
                        <div className="col-md-6">
                          <div className="detail-card card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center">
                              <div className="detail-icon me-3">
                                <Calendar size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <small className="detail-label">
                                  Data de Conclusão
                                </small>
                                <div className="detail-value">
                                  {formatDate(
                                    certificado.dataConclusao ||
                                      certificado.dataEmissao
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Final Grade */}
                        <div className="col-md-6">
                          <div className="detail-card card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center">
                              <div className="detail-icon me-3">
                                <GraduationCap size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <small className="detail-label">
                                  Nota Final
                                </small>
                                <div
                                  className={`detail-value fw-bold ${getGradeColor(
                                    certificado.notaFinal
                                  )}`}
                                >
                                  {formatGrade(certificado.notaFinal)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Verification Code */}
                        <div className="col-12">
                          <div className="detail-card card border-0 shadow-sm">
                            <div className="card-body d-flex align-items-center">
                              <div className="detail-icon me-3">
                                <Award size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <small className="detail-label">
                                  Código de Verificação
                                </small>
                                <div className="detail-value">
                                  <span className="verification-code">
                                    {certificado.codigo}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Instructions - Show only when no code in URL and no results */}
                {!certificateId && !error && !isVerified && !isLoading && (
                  <div className="verification-instructions">
                    <div className="row g-4 text-center">
                      <div className="col-md-4">
                        <div className="instruction-item">
                          <Search size={32} className="text-primary mb-3" />
                          <h5 className="fw-bold">1. Insira o Código</h5>
                          <p className="text-muted">
                            Digite o código de 16 caracteres encontrado no
                            certificado
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="instruction-item">
                          <CheckCircle
                            size={32}
                            className="text-success mb-3"
                          />
                          <h5 className="fw-bold">2. Verificação</h5>
                          <p className="text-muted">
                            O sistema verifica a autenticidade do certificado
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="instruction-item">
                          <Award size={32} className="text-warning mb-3" />
                          <h5 className="fw-bold">3. Confirmação</h5>
                          <p className="text-muted">
                            Receba todos os detalhes do certificado verificado
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyCertificate;
