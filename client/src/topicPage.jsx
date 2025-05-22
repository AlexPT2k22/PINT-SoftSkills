import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

function TopicManagement() {
  const [topics, setTopics] = useState([]);
  const [areas, setAreas] = useState([]);
  const [newTopic, setNewTopic] = useState({
    titulo: '',
    descricao: '',
    areaId: ''
  });

  useEffect(() => {
    fetchTopics();
    fetchAreas();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/topicos');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/areas');
      setAreas(response.data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/topicos', newTopic);
      fetchTopics();
      setNewTopic({ titulo: '', descricao: '', areaId: '' });
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Gestão de Tópicos</h2>
      
      {/* Topic Creation Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Novo Tópico</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Área</label>
              <select 
                className="form-select"
                value={newTopic.areaId}
                onChange={(e) => setNewTopic({...newTopic, areaId: e.target.value})}
                required
              >
                <option value="">Selecione uma área</option>
                {areas.map(area => (
                  <option key={area.ID_AREA} value={area.ID_AREA}>
                    {area.NOME}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Título</label>
              <input
                type="text"
                className="form-control"
                value={newTopic.titulo}
                onChange={(e) => setNewTopic({...newTopic, titulo: e.target.value})}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Descrição</label>
              <textarea
                className="form-control"
                value={newTopic.descricao}
                onChange={(e) => setNewTopic({...newTopic, descricao: e.target.value})}
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Plus size={18} className="me-2" />
              Criar Tópico
            </button>
          </form>
        </div>
      </div>

      {/* Topics List */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Tópicos Existentes</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Área</th>
                  <th>Data de Criação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {topics.map(topic => (
                  <tr key={topic.ID_TOPICO}>
                    <td>{topic.TITULO}</td>
                    <td>{topic.Area?.NOME}</td>
                    <td>{new Date(topic.DATA_CRIACAO).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-primary">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicManagement;