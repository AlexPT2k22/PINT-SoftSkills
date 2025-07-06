const {
  AvaliacaoFinalSincrona,
  Utilizador,
  UtilizadorTemPerfil,
  CursoSincrono,
  InscricaoSincrono,
  Curso,
} = require("../models/index.js");
const { Op } = require("sequelize");

// Obter todas as avaliações finais de um curso (para o formador)
const getAvaliacoesFinaisByCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const userId = req.user.ID_UTILIZADOR;

    // Verificar se o utilizador é formador do curso
    const curso = await CursoSincrono.findOne({
      where: {
        ID_CURSO: cursoId,
        ID_UTILIZADOR: userId,
      },
    });

    if (!curso) {
      return res.status(403).json({
        message: "Não tem permissão para aceder a estas avaliações finais",
      });
    }

    // Obter todos os alunos inscritos no curso com dados mais detalhados
    const inscricoes = await InscricaoSincrono.findAll({
      where: { ID_CURSO_SINCRONO: cursoId },
      include: [
        {
          model: Utilizador,
          attributes: ["ID_UTILIZADOR", "NOME", "USERNAME", "EMAIL"],
          required: true, // INNER JOIN para garantir que o utilizador existe
        },
      ],
    });

    console.log(`Curso ID: ${cursoId}, Formador ID: ${userId}`);
    console.log(
      `Encontradas ${inscricoes.length} inscrições para o curso ${cursoId}`
    );

    if (inscricoes.length === 0) {
      console.log(
        "Nenhuma inscrição encontrada. Verificando se o curso existe..."
      );
      const cursoExiste = await CursoSincrono.findByPk(cursoId);
      console.log("Curso existe:", !!cursoExiste);
    }

    // Para cada aluno, verificar se já tem avaliação final
    const avaliacoesFinais = [];

    for (const inscricao of inscricoes) {
      console.log("Processando inscrição:", {
        inscricaoId: inscricao.ID_INSCRICAO_SINCRONO,
        alunoId: inscricao.ID_UTILIZADOR,
        utilizador: inscricao.UTILIZADOR,
      });

      const avaliacaoExistente = await AvaliacaoFinalSincrona.findOne({
        where: {
          UTI_ID_UTILIZADOR: userId, // Formador
          UTI_ID_UTILIZADOR2: inscricao.ID_UTILIZADOR, // Aluno
        },
      });

      avaliacoesFinais.push({
        aluno: inscricao.UTILIZADOR,
        avaliacaoFinal: avaliacaoExistente,
        cursoId: cursoId,
      });
    }

    console.log("Resultado final:", JSON.stringify(avaliacoesFinais, null, 2));
    res.status(200).json(avaliacoesFinais);
  } catch (error) {
    console.error("Erro ao buscar avaliações finais:", error);
    res.status(500).json({ message: error.message });
  }
};

// Criar ou atualizar avaliação final de um aluno
const criarOuAtualizarAvaliacaoFinal = async (req, res) => {
  try {
    const { cursoId, alunoId } = req.params;
    const { notaFinal, observacao } = req.body;
    const formadorId = req.user.ID_UTILIZADOR;

    // Verificar se o utilizador é formador do curso
    const curso = await CursoSincrono.findOne({
      where: {
        ID_CURSO: cursoId,
        ID_UTILIZADOR: formadorId,
      },
    });

    if (!curso) {
      return res.status(403).json({
        message: "Não tem permissão para avaliar este curso",
      });
    }

    // Verificar se o aluno está inscrito no curso
    const inscricao = await InscricaoSincrono.findOne({
      where: {
        ID_CURSO_SINCRONO: cursoId,
        ID_UTILIZADOR: alunoId,
      },
    });

    if (!inscricao) {
      return res.status(404).json({
        message: "Aluno não encontrado neste curso",
      });
    }

    // Verificar se já existe avaliação final
    const avaliacaoExistente = await AvaliacaoFinalSincrona.findOne({
      where: {
        UTI_ID_UTILIZADOR: formadorId, // Formador é UTI_ID_UTILIZADOR
        UTI_ID_UTILIZADOR2: alunoId, // Aluno é UTI_ID_UTILIZADOR2
      },
    });

    if (avaliacaoExistente) {
      // Atualizar avaliação existente
      await avaliacaoExistente.update({
        NOTA_FINAL: notaFinal,
        OBSERVACAO: observacao,
        DATA_AVALIACAO: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Avaliação final atualizada com sucesso",
        avaliacaoFinal: avaliacaoExistente,
      });
    } else {
      // Criar nova avaliação final
      const novaAvaliacaoFinal = await AvaliacaoFinalSincrona.create({
        UTI_ID_UTILIZADOR: formadorId, // Formador é UTI_ID_UTILIZADOR
        UTI_ID_UTILIZADOR2: alunoId, // Aluno é UTI_ID_UTILIZADOR2
        NOTA_FINAL: notaFinal,
        OBSERVACAO: observacao,
        DATA_AVALIACAO: new Date(),
      });

      res.status(201).json({
        success: true,
        message: "Avaliação final criada com sucesso",
        avaliacaoFinal: novaAvaliacaoFinal,
      });
    }
  } catch (error) {
    console.error("Erro ao criar/atualizar avaliação final:", error);
    res.status(500).json({ message: error.message });
  }
};

// Obter avaliação final de um aluno específico (para o próprio aluno)
const getMinhaAvaliacaoFinal = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const alunoId = req.user.ID_UTILIZADOR;

    // Verificar se o aluno está inscrito no curso
    const inscricao = await InscricaoSincrono.findOne({
      where: {
        ID_CURSO_SINCRONO: cursoId,
        ID_UTILIZADOR: alunoId,
      },
    });

    if (!inscricao) {
      return res.status(404).json({
        message: "Não está inscrito neste curso",
      });
    }

    // Buscar avaliação final do aluno
    const avaliacaoFinal = await AvaliacaoFinalSincrona.findOne({
      where: {
        UTI_ID_UTILIZADOR2: alunoId, // Aluno é UTI_ID_UTILIZADOR2
      },
      include: [
        {
          model: Utilizador,
          as: "Formador", // Formador é UTI_ID_UTILIZADOR
          attributes: ["NOME", "USERNAME"],
        },
      ],
    });

    if (!avaliacaoFinal) {
      return res.status(404).json({
        message: "Avaliação final ainda não disponível",
      });
    }

    res.status(200).json(avaliacaoFinal);
  } catch (error) {
    console.error("Erro ao buscar avaliação final:", error);
    res.status(500).json({ message: error.message });
  }
};

// Obter todas as avaliações finais de um utilizador (para o percurso formativo)
const getMinhasAvaliacoesFinais = async (req, res) => {
  try {
    const alunoId = req.user.ID_UTILIZADOR;

    const avaliacoesFinais = await AvaliacaoFinalSincrona.findAll({
      where: {
        UTI_ID_UTILIZADOR2: alunoId, // Aluno é UTI_ID_UTILIZADOR2
      },
      include: [
        {
          model: Utilizador,
          as: "Formador", // Formador é UTI_ID_UTILIZADOR
          attributes: ["NOME", "USERNAME"],
        },
      ],
    });

    // Para cada avaliação final, obter informações do curso
    const avaliacoesComCurso = [];

    for (const avaliacao of avaliacoesFinais) {
      // Encontrar o curso através do formador
      const cursoSincrono = await CursoSincrono.findOne({
        where: { ID_UTILIZADOR: avaliacao.UTI_ID_UTILIZADOR }, // Formador é UTI_ID_UTILIZADOR
        include: [
          {
            model: Curso,
            attributes: ["ID_CURSO", "NOME", "DESCRICAO"],
          },
        ],
      });

      if (cursoSincrono) {
        avaliacoesComCurso.push({
          ...avaliacao.toJSON(),
          curso: cursoSincrono.Curso,
        });
      }
    }

    res.status(200).json(avaliacoesComCurso);
  } catch (error) {
    console.error("Erro ao buscar avaliações finais do utilizador:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvaliacoesFinaisByCurso,
  criarOuAtualizarAvaliacaoFinal,
  getMinhaAvaliacaoFinal,
  getMinhasAvaliacoesFinais,
};
