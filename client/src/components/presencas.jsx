import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";

const ListaPresenca = ({ aulaId }) => {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [presencas, setPresencas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPresencas();
  }, [aulaId]);

  const fetchPresencas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${URL}/api/aulas/${aulaId}/presenca`
      );
      setPresencas(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar lista de presença:", error);
      setLoading(false);
    }
  };

  const handleMarcarPresenca = async (alunoId, presente) => {
    try {
      await axios.post(`${URL}/api/aulas/${aulaId}/presenca`, {
        alunoId,
        presente,
      });
      fetchPresencas();
    } catch (error) {
      console.error("Erro ao marcar presença:", error);
    }
  };

  return (
    <div className="lista-presenca">
      <h5 className="mb-4">Lista de Presença</h5>

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : presencas.length === 0 ? (
        <div className="alert alert-info">
          Nenhum aluno inscrito nesta aula.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Hora de Entrada</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {presencas.map((presenca) => (
                <tr key={presenca.ID_PRESENCA}>
                  <td>
                    {presenca.Utilizador?.NOME || presenca.Utilizador?.USERNAME}
                  </td>
                  <td>
                    {presenca.HORA_ENTRADA
                      ? new Date(presenca.HORA_ENTRADA).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          presenca.PRESENTE
                            ? "btn-success"
                            : "btn-outline-success"
                        }`}
                        onClick={() =>
                          handleMarcarPresenca(
                            presenca.Utilizador.ID_UTILIZADOR,
                            true
                          )
                        }
                        title="Marcar presente"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          !presenca.PRESENTE
                            ? "btn-danger"
                            : "btn-outline-danger"
                        }`}
                        onClick={() =>
                          handleMarcarPresenca(
                            presenca.Utilizador.ID_UTILIZADOR,
                            false
                          )
                        }
                        title="Marcar ausente"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaPresenca;
