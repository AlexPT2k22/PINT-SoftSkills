import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AvaliacoesSincronas = ({ cursoId }) => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [novaAvaliacao, setNovaAvaliacao] = useState({
    NOTA: '',
    OBSERVACAO: '',
    DATA_LIMITE_REALIZACAO: ''
  });

  useEffect(() => {
    fetchAvaliacoes();
  }, [cursoId]);

  const fetchAvaliacoes = async () => {
    try {
      const response = await axios.get(`/api/avaliacoes/curso/${cursoId}`);
      setAvaliacoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/avaliacoes', {
        ...novaAvaliacao,
        ID_CURSO: cursoId
      });
      fetchAvaliacoes();
      setNovaAvaliacao({
        NOTA: '',
        OBSERVACAO: '',
        DATA_LIMITE_REALIZACAO: ''
      });
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Avaliações do Curso</h3>
      
      {/* Formulário para nova avaliação */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Nota</label>
          <input
            type="number"
            className="form-control"
            value={novaAvaliacao.NOTA}
            onChange={(e) => setNovaAvaliacao({
              ...novaAvaliacao,
              NOTA: e.target.value
            })}
            min="0"
            max="20"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Observação</label>
          <textarea
            className="form-control"
            value={novaAvaliacao.OBSERVACAO}
            onChange={(e) => setNovaAvaliacao({
              ...novaAvaliacao,
              OBSERVACAO: e.target.value
            })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Data Limite</label>
          <input
            type="datetime-local"
            className="form-control"
            value={novaAvaliacao.DATA_LIMITE_REALIZACAO}
            onChange={(e) => setNovaAvaliacao({
              ...novaAvaliacao,
              DATA_LIMITE_REALIZACAO: e.target.value
            })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Criar Avaliação
        </button>
      </form>

      {/* Lista de avaliações */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Nota</th>
              <th>Estado</th>
              <th>Observação</th>
              <th>Data Limite</th>
            </tr>
          </thead>
          <tbody>
            {avaliacoes.map((avaliacao) => (
              <tr key={avaliacao.ID_AVALIACAO_SINCRONA}>
                <td>{new Date(avaliacao.DATA_REALIZACAO).toLocaleDateString()}</td>
                <td>{avaliacao.NOTA}</td>
                <td>{avaliacao.ESTADO}</td>
                <td>{avaliacao.OBSERVACAO}</td>
                <td>
                  {avaliacao.DATA_LIMITE_REALIZACAO 
                    ? new Date(avaliacao.DATA_LIMITE_REALIZACAO).toLocaleDateString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AvaliacoesSincronas;