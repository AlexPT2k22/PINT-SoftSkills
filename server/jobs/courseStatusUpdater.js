const { CursoAssincrono, CursoSincrono } = require('../models/index.js');
const { Op } = require('sequelize');

// Função para atualizar status de cursos assíncronos
const updateAsyncCoursesStatus = async () => {
  try {
    const today = new Date();
    
    // Cursos que deveriam começar hoje - ativar
    await CursoAssincrono.update(
      { ESTADO: 'Ativo' },
      {
        where: {
          DATA_INICIO: { [Op.lte]: today },
          DATA_FIM: { [Op.gte]: today },
          ESTADO: 'Inativo'
        }
      }
    );

    // Cursos que terminaram - desativar
    await CursoAssincrono.update(
      { ESTADO: 'Inativo' },
      {
        where: {
          DATA_FIM: { [Op.lt]: today },
          ESTADO: 'Ativo'
        }
      }
    );

    console.log('Status de cursos assíncronos atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar status dos cursos assíncronos:', error);
  }
};

// Função para atualizar status de cursos síncronos
const updateSyncCoursesStatus = async () => {
  try {
    const today = new Date();
    
    // Cursos que deveriam começar hoje - mudar para "Em curso"
    await CursoSincrono.update(
      { ESTADO: 'Em curso' },
      {
        where: {
          DATA_INICIO: { [Op.lte]: today },
          DATA_FIM: { [Op.gte]: today },
          ESTADO: 'Ativo'
        }
      }
    );

    // Cursos que terminaram - mudar para "Terminado"
    await CursoSincrono.update(
      { ESTADO: 'Terminado' },
      {
        where: {
          DATA_FIM: { [Op.lt]: today },
          ESTADO: { [Op.in]: ['Ativo', 'Em curso'] }
        }
      }
    );

    console.log('Status de cursos síncronos atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar status dos cursos síncronos:', error);
  }
};

module.exports = {
  updateAsyncCoursesStatus,
  updateSyncCoursesStatus
};