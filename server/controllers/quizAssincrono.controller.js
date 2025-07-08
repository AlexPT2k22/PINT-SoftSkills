const {
  QuizAssincrono,
  RespostaQuizAssincrono,
  Curso,
  CursoAssincrono,
  CursoSincrono,
  Utilizador,
  UtilizadorTemPerfil,
  InscricaoAssincrono,
} = require("../models/index.js");
const { Op } = require("sequelize");


const createQuiz = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const {
      ID_CURSO,
      TITULO,
      DESCRICAO,
      PERGUNTAS,
      TEMPO_LIMITE_MIN,
      NOTA_MINIMA,
    } = req.body;

    
    const userProfile = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 }, 
    });

    if (!userProfile) {
      return res.status(403).json({
        message: "Apenas gestores podem criar quizzes",
      });
    }

    
    const curso = await Curso.findByPk(ID_CURSO, {
      include: [{ model: CursoAssincrono }],
    });

    console.log("Curso encontrado:", curso);

    if (!curso || !curso.CURSO_ASSINCRONO) {
      return res.status(404).json({
        message: "Curso assíncrono não encontrado",
      });
    }

    
    const quizExistente = await QuizAssincrono.findOne({
      where: { ID_CURSO },
    });

    if (quizExistente) {
      return res.status(400).json({
        message: "Este curso já possui um quiz. Edite o quiz existente.",
      });
    }

    
    if (!Array.isArray(PERGUNTAS) || PERGUNTAS.length === 0) {
      return res.status(400).json({
        message: "É necessário adicionar pelo menos uma pergunta",
      });
    }

    
    const perguntasValidas = PERGUNTAS.every(
      (pergunta) =>
        pergunta.pergunta &&
        pergunta.opcoes &&
        Array.isArray(pergunta.opcoes) &&
        pergunta.opcoes.length >= 2 &&
        pergunta.resposta_correta !== undefined
    );

    if (!perguntasValidas) {
      return res.status(400).json({
        message: "Formato das perguntas inválido",
      });
    }

    const quiz = await QuizAssincrono.create({
      ID_CURSO,
      TITULO,
      DESCRICAO,
      PERGUNTAS,
      TEMPO_LIMITE_MIN: TEMPO_LIMITE_MIN || 30,
      NOTA_MINIMA: (NOTA_MINIMA * 100) / 20 || 50, 
      CRIADO_POR: userId,
    });

    res.status(201).json({
      success: true,
      message: "Quiz criado com sucesso",
      quiz,
    });
  } catch (error) {
    console.error("Erro ao criar quiz:", error);
    res.status(500).json({ message: error.message });
  }
};


const getQuizByCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const cursoSincrono = await CursoSincrono.findByPk(cursoId);
    if (cursoSincrono) {
      return res.status(200).json({
        hasQuiz: false,
        message: "Curso síncrono não possui quiz",
        isSynchronous: true,
      });
    }

    const quiz = await QuizAssincrono.findOne({
      where: { ID_CURSO: cursoId, ATIVO: true },
      include: [
        {
          model: Utilizador,
          as: "CRIADOR",
          attributes: ["NOME", "USERNAME"],
        },
      ],
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Nenhum quiz encontrado para este curso",
        hasQuiz: false,
      });
    }

    res.status(200).json({
      hasQuiz: true,
      quiz,
    });
  } catch (error) {
    console.error("Erro ao procurar quiz:", error);
    res.status(500).json({ message: error.message });
  }
};


const updateQuiz = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { quizId } = req.params;
    const {
      TITULO,
      DESCRICAO,
      PERGUNTAS,
      TEMPO_LIMITE_MIN,
      NOTA_MINIMA,
      ATIVO,
    } = req.body;

    
    const userProfile = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
    });

    if (!userProfile) {
      return res.status(403).json({
        message: "Apenas gestores podem editar quizzes",
      });
    }

    const quiz = await QuizAssincrono.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz não encontrado",
      });
    }

    
    if (PERGUNTAS) {
      if (!Array.isArray(PERGUNTAS) || PERGUNTAS.length === 0) {
        return res.status(400).json({
          message: "É necessário ter pelo menos uma pergunta",
        });
      }

      const perguntasValidas = PERGUNTAS.every(
        (pergunta) =>
          pergunta.pergunta &&
          pergunta.opcoes &&
          Array.isArray(pergunta.opcoes) &&
          pergunta.opcoes.length >= 2 &&
          pergunta.resposta_correta !== undefined
      );

      if (!perguntasValidas) {
        return res.status(400).json({
          message: "Formato das perguntas inválido",
        });
      }
    }

    await quiz.update({
      TITULO: TITULO || quiz.TITULO,
      DESCRICAO: DESCRICAO || quiz.DESCRICAO,
      PERGUNTAS: PERGUNTAS || quiz.PERGUNTAS,
      TEMPO_LIMITE_MIN: TEMPO_LIMITE_MIN || quiz.TEMPO_LIMITE_MIN,
      NOTA_MINIMA: NOTA_MINIMA ? (NOTA_MINIMA * 100) / 20 : quiz.NOTA_MINIMA,
      ATIVO: ATIVO !== undefined ? ATIVO : quiz.ATIVO,
    });

    res.status(200).json({
      success: true,
      message: "Quiz atualizado com sucesso",
      quiz,
    });
  } catch (error) {
    console.error("Erro ao atualizar quiz:", error);
    res.status(500).json({ message: error.message });
  }
};


const submitQuizResponse = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { quizId } = req.params;
    const { RESPOSTAS, TEMPO_GASTO_MIN } = req.body;

    
    const quiz = await QuizAssincrono.findByPk(quizId);
    if (!quiz || !quiz.ATIVO) {
      return res.status(404).json({
        message: "Quiz não encontrado ou inativo",
      });
    }

    
    const cursoAssincrono = await CursoAssincrono.findOne({
      where: { ID_CURSO: quiz.ID_CURSO },
    });

    if (cursoAssincrono) {
      const inscricao = await InscricaoAssincrono.findOne({
        where: {
          ID_UTILIZADOR: userId,
          ID_CURSO_ASSINCRONO: cursoAssincrono.ID_CURSO_ASSINCRONO,
        },
      });

      if (!inscricao) {
        return res.status(403).json({
          message: "Você não está inscrito neste curso",
        });
      }
    }

    
    const respostaExistente = await RespostaQuizAssincrono.findOne({
      where: { ID_QUIZ: quizId, ID_UTILIZADOR: userId },
    });

    if (respostaExistente) {
      return res.status(400).json({
        message: "Você já respondeu a este quiz",
      });
    }

    
    const perguntas = quiz.PERGUNTAS;
    let acertos = 0;

    for (let i = 0; i < perguntas.length; i++) {
      const pergunta = perguntas[i];
      const respostaUsuario = RESPOSTAS[i];

      if (respostaUsuario === pergunta.resposta_correta) {
        acertos++;
      }
    }

    const nota = (acertos / perguntas.length) * 100;

    
    const resposta = await RespostaQuizAssincrono.create({
      ID_QUIZ: quizId,
      ID_UTILIZADOR: userId,
      RESPOSTAS,
      NOTA: nota,
      TEMPO_GASTO_MIN: TEMPO_GASTO_MIN || null,
    });

    
    const passou = nota >= quiz.NOTA_MINIMA;

    res.status(201).json({
      success: true,
      message: passou
        ? "Quiz concluído com sucesso!"
        : `Nota insuficiente. Mínimo: ${quiz.NOTA_MINIMA} valores`,
      nota,
      acertos,
      totalPerguntas: perguntas.length,
      passou,
      notaMinima: quiz.NOTA_MINIMA,
    });
  } catch (error) {
    console.error("Erro ao submeter resposta:", error);
    res.status(500).json({ message: error.message });
  }
};


const getUserQuizResult = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { quizId } = req.params;

    const resposta = await RespostaQuizAssincrono.findOne({
      where: { ID_QUIZ: quizId, ID_UTILIZADOR: userId },
      include: [
        {
          model: QuizAssincrono,
          attributes: ["TITULO", "NOTA_MINIMA", "PERGUNTAS"],
        },
      ],
    });

    if (!resposta) {
      return res.status(404).json({
        message: "Você ainda não respondeu a este quiz",
        hasResponse: false,
      });
    }

    const passou = resposta.NOTA >= resposta.QuizAssincrono.NOTA_MINIMA;

    res.status(200).json({
      hasResponse: true,
      nota: resposta.NOTA,
      passou,
      dataSubmissao: resposta.DATA_SUBMISSAO,
      tempoGasto: resposta.TEMPO_GASTO_MIN,
      tentativa: resposta.TENTATIVA,
      notaMinima: resposta.QuizAssincrono.NOTA_MINIMA,
    });
  } catch (error) {
    console.error("Erro ao procurar resultado:", error);
    res.status(500).json({ message: error.message });
  }
};


const getQuizStats = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { quizId } = req.params;

    
    const userProfile = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
    });

    if (!userProfile) {
      return res.status(403).json({
        message: "Apenas gestores podem ver estatísticas",
      });
    }

    const quiz = await QuizAssincrono.findByPk(quizId, {
      include: [
        {
          model: RespostaQuizAssincrono,
          as: "RESPOSTAS",
          include: [
            {
              model: Utilizador,
              as: "UTILIZADOR",
              attributes: ["NOME", "USERNAME"],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz não encontrado",
      });
    }

    const respostas = quiz.RESPOSTAS;
    const totalRespostas = respostas.length;
    const aprovados = respostas.filter(
      (r) => r.NOTA >= quiz.NOTA_MINIMA
    ).length;
    const reprovados = totalRespostas - aprovados;

    const notaMedia =
      totalRespostas > 0
        ? respostas.reduce((sum, r) => sum + r.NOTA, 0) / totalRespostas
        : 0;

    const stats = {
      totalRespostas,
      aprovados,
      reprovados,
      notaMedia: Math.round(notaMedia * 100) / 100,
      taxaAprovacao:
        totalRespostas > 0 ? (aprovados / totalRespostas) * 100 : 0,
      respostas: respostas.map((r) => ({
        utilizador: r.UTILIZADOR.NOME || r.UTILIZADOR.USERNAME,
        nota: r.NOTA,
        dataSubmissao: r.DATA_SUBMISSAO,
        tempoGasto: r.TEMPO_GASTO_MIN,
        passou: r.NOTA >= quiz.NOTA_MINIMA,
      })),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Erro ao procurar estatísticas:", error);
    res.status(500).json({ message: error.message });
  }
};


const deleteQuiz = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { quizId } = req.params;

    
    const userProfile = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
    });

    if (!userProfile) {
      return res.status(403).json({
        message: "Apenas gestores podem deletar quizzes",
      });
    }

    const quiz = await QuizAssincrono.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz não encontrado",
      });
    }

    
    await RespostaQuizAssincrono.destroy({
      where: { ID_QUIZ: quizId },
    });

    
    await quiz.destroy();

    res.status(200).json({
      success: true,
      message: "Quiz deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar quiz:", error);
    res.status(500).json({ message: error.message });
  }
};

const getProximosQuizzes = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;

    
    const inscricoes = await InscricaoAssincrono.findAll({
      where: { ID_UTILIZADOR: userId },
      attributes: ["ID_CURSO_ASSINCRONO"],
    });

    const today = new Date();

    const cursoAssincronoIds = inscricoes.map(
      (insc) => insc.ID_CURSO_ASSINCRONO
    );

    
    const cursosAssincronos = await CursoAssincrono.findAll({
      where: {
        ID_CURSO_ASSINCRONO: { [Op.in]: cursoAssincronoIds },
        ESTADO: ["Ativo", "Em curso"],
      },
      include: [
        {
          model: Curso,
          attributes: ["ID_CURSO", "NOME"],
          include: [
            {
              model: CursoAssincrono,
              where: {
                ESTADO: ["Ativo", "Em curso"],
                ID_CURSO_ASSINCRONO: { [Op.in]: cursoAssincronoIds },
              },
              attributes: ["ESTADO", "DATA_INICIO", "DATA_FIM"],
              required: true,
            },
          ],
        },
      ],
    });

    const cursoIds = cursosAssincronos.map((ca) => ca.ID_CURSO);

    
    const quizzes = await QuizAssincrono.findAll({
      where: {
        ID_CURSO: { [Op.in]: cursoIds },
        ATIVO: true,
      },
      include: [
        {
          model: Curso,
          attributes: ["NOME"],
        },
        {
          model: RespostaQuizAssincrono,
          as: "RESPOSTAS",
          where: { ID_UTILIZADOR: userId },
          required: false,
          attributes: ["ID_RESPOSTA", "NOTA", "DATA_SUBMISSAO"],
        },
      ],
      order: [["DATA_CRIACAO", "ASC"]],
    });

    
    const quizzesPendentes = quizzes.filter((quiz) => {
      
      return quiz.RESPOSTAS.length === 0;
    });

    res.status(200).json(quizzesPendentes);
  } catch (error) {
    console.error("Erro ao procurar próximos quizzes:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuiz,
  getQuizByCurso,
  updateQuiz,
  submitQuizResponse,
  getUserQuizResult,
  getQuizStats,
  deleteQuiz,
  getProximosQuizzes,
};
