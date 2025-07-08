const {
  Utilizador,
  UtilizadorTemPerfil,
  Perfil,
  Curso,
  CursoSincrono,
  CursoAssincrono,
  Area,
  Categoria,
  InscricaoSincrono,
  InscricaoAssincrono,
  Modulos,
  SubmissaoAvaliacao,
  RespostaQuizAssincrono,
  ProgressoModulo,
  AvaliacaoFinalSincrona,
} = require("../models/index.js");
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  EmailFormadorNovo,
  sendEnrollmentConfirmationEmail,
  sendConfirmationEmail,
} = require("../mail/emails.js");
require("dotenv").config();
const URL = process.env.URL || "http://localhost:5173";

const getTeachers = async (req, res) => {
  try {
    const teachers = await Utilizador.findAll({
      attributes: ["ID_UTILIZADOR", "USERNAME", "NOME"],
      include: [
        {
          model: Perfil,
          where: {
            [Op.or]: [
              { ID_PERFIL: 2 },
              { PERFIL: "Formador" },
              { ID_PERFIL: 3 },
              { PERFIL: "Gestor" },
            ],
          },
          attributes: [],
          through: { attributes: [] },
        },
      ],
    });
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Erro ao procurar os professores:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCursosAssociados = async (req, res) => {
  try {
    const id = req.user.ID_UTILIZADOR;

    const cursos = await Curso.findAll({
      include: [
        {
          model: CursoSincrono,
          where: { ID_UTILIZADOR: id },
          required: true,
          attributes: ["ESTADO", "DATA_INICIO", "DATA_FIM", "VAGAS"],
        },
        {
          model: Area,
          attributes: ["NOME"],
          include: [
            {
              model: Categoria,
              as: "Categoria",
              attributes: ["NOME__"],
            },
          ],
        },
      ],
    });

    res.status(200).json(cursos);
  } catch (error) {
    console.error("Erro ao procurar os cursos associados:", error);
    res.status(500).json({ message: error.message });
  }
};

const inscreverEmCurso = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { courseId } = req.params;
    const { courseType } = req.body;

    console.log("ID do utilizador:", userId);
    console.log("ID do curso:", courseId);
    console.log("Tipo de curso:", courseType);

    const cursoBase = await Curso.findByPk(courseId);
    if (!cursoBase) {
      return res.status(404).json({
        success: false,
        message: "Curso não encontrado",
      });
    }

    if (courseType.toLowerCase() === "sincrono") {
      return await inscreverEmCursoSincrono(userId, courseId, req, res);
    } else if (courseType.toLowerCase() === "assincrono") {
      return await inscreverEmCursoAssincrono(userId, courseId, req, res);
    } else {
      return res.status(400).json({
        success: false,
        message: "Tipo de curso inválido, deve ser 'sincrono' ou 'assincrono'",
      });
    }
  } catch (error) {
    console.error("Erro ao inscrever no curso:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const inscreverEmCursoSincrono = async (userId, courseId, req, res) => {
  try {
    const curso = await CursoSincrono.findByPk(courseId);
    if (!curso) {
      return res.status(404).json({
        success: false,
        message: "Curso síncrono não encontrado",
      });
    }

    if (curso.DATA_LIMITE_INSCRICAO_S) {
      const dataLimite = new Date(curso.DATA_LIMITE_INSCRICAO_S);
      const dataAtual = new Date();

      if (dataAtual > dataLimite) {
        return res.status(400).json({
          success: false,
          message: "O prazo para inscrição neste curso já expirou",
        });
      }
    }

    const inscricaoExistente = await InscricaoSincrono.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO_SINCRONO: courseId,
      },
    });

    if (inscricaoExistente) {
      return res.status(400).json({
        success: false,
        message: "Você já está inscrito neste curso síncrono",
      });
    }

    if (curso.VAGAS <= 0) {
      return res.status(400).json({
        success: false,
        message: "Não há vagas disponíveis neste curso síncrono",
      });
    }

    const novaInscricao = await InscricaoSincrono.create({
      ID_UTILIZADOR: userId,
      ID_CURSO_SINCRONO: courseId,
      DATA_INSCRICAO: new Date(),
      DATA_LIMITE_INSCRICAO_S: curso.DATA_INICIO,
      FORMULARIO_INSCRICAO: req.body.formulario || null,
      DATA_LIMITE_INSCRICAO_S: curso.DATA_LIMITE_INSCRICAO_S,
    });

    await curso.update({
      VAGAS: curso.VAGAS - 1,
    });

    const cursoCompleto = await Curso.findByPk(courseId, {
      include: [{ model: CursoSincrono }],
    });

    const user = await Utilizador.findByPk(userId);
    const formador = curso.ID_UTILIZADOR
      ? await Utilizador.findByPk(curso.ID_UTILIZADOR)
      : null;

    await sendEnrollmentConfirmationEmail(
      user.NOME || user.USERNAME,
      user.EMAIL,
      cursoCompleto,
      "sincrono",
      formador
    );

    res.status(201).json({
      success: true,
      message: "Inscrição no curso síncrono realizada com sucesso",
      inscricao: novaInscricao,
    });
  } catch (error) {
    console.error("Erro ao inscrever no curso síncrono:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const inscreverEmCursoAssincrono = async (userId, courseId, req, res) => {
  try {
    const curso = await CursoAssincrono.findOne({
      where: { ID_CURSO: courseId },
    });

    if (!curso) {
      return res.status(404).json({
        success: false,
        message: "Curso assíncrono não encontrado",
      });
    }

    const inscricaoExistente = await InscricaoAssincrono.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO_ASSINCRONO: curso.ID_CURSO_ASSINCRONO,
      },
    });

    if (inscricaoExistente) {
      return res.status(400).json({
        success: false,
        message: "Você já está inscrito neste curso assíncrono",
      });
    }

    const novaInscricao = await InscricaoAssincrono.create({
      ID_UTILIZADOR: userId,
      ID_CURSO_ASSINCRONO: curso.ID_CURSO_ASSINCRONO,
      DATA_INSCRICAO: new Date(),
      ESTADO: "Ativo",
    });

    const cursoCompleto = await Curso.findByPk(courseId, {
      include: [{ model: CursoAssincrono }],
    });

    const user = await Utilizador.findByPk(userId);

    await sendEnrollmentConfirmationEmail(
      user.NOME || user.USERNAME,
      user.EMAIL,
      cursoCompleto,
      "assincrono"
    );

    res.status(201).json({
      success: true,
      message: "Inscrição no curso assíncrono realizada com sucesso",
      inscricao: novaInscricao,
    });
  } catch (error) {
    console.error("Erro ao inscrever no curso assíncrono:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verificarInscricao = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { courseId } = req.params;

    const cursoSincrono = await CursoSincrono.findOne({
      where: { ID_CURSO: courseId },
    });

    if (cursoSincrono) {
      const inscricaoSincrono = await InscricaoSincrono.findOne({
        where: {
          ID_UTILIZADOR: userId,
          ID_CURSO_SINCRONO: courseId,
        },
      });

      if (inscricaoSincrono) {
        return res.status(200).json({
          inscrito: true,
          inscricao: inscricaoSincrono,
          tipo: "sincrono",
        });
      }
    }

    const cursoAssincrono = await CursoAssincrono.findOne({
      where: { ID_CURSO: courseId },
    });

    if (cursoAssincrono) {
      const inscricaoAssincrono = await InscricaoAssincrono.findOne({
        where: {
          ID_UTILIZADOR: userId,
          ID_CURSO_ASSINCRONO: cursoAssincrono.ID_CURSO_ASSINCRONO,
        },
      });

      if (inscricaoAssincrono) {
        return res.status(200).json({
          inscrito: true,
          inscricao: inscricaoAssincrono,
          tipo: "assincrono",
        });
      }
    }
    return res.status(200).json({
      inscrito: false,
      message: "Utilizador não está inscrito neste curso",
    });
  } catch (error) {
    console.error("Erro ao verificar inscrição:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCursosInscritos = async (req, res) => {
  try {
    const id = req.user.ID_UTILIZADOR;
    console.log("ID do utilizador:", id);

    const cursosSincronosComInscricao = await CursoSincrono.findAll({
      attributes: ["ID_CURSO"],
      include: [
        {
          model: InscricaoSincrono,
          where: {
            ID_UTILIZADOR: id,
          },
          required: true,
          attributes: [],
        },
      ],
    });

    const idsCursosSincronos = cursosSincronosComInscricao
      .map((c) => c.ID_CURSO)
      .filter(Boolean);
    console.log("IDs de cursos síncronos encontrados:", idsCursosSincronos);

    const cursosAssincronosComInscricao = await CursoAssincrono.findAll({
      attributes: ["ID_CURSO"],
      include: [
        {
          model: InscricaoAssincrono,
          where: {
            ID_UTILIZADOR: id,
          },
          required: true,
          attributes: [],
        },
      ],
      where: {
        ESTADO: ["Ativo", "Em curso"],
      },
    });

    const idsCursosAssincronos = cursosAssincronosComInscricao
      .map((c) => c.ID_CURSO)
      .filter(Boolean);
    console.log("IDs de cursos assíncronos encontrados:", idsCursosAssincronos);

    const todosCursosIds = [...idsCursosSincronos, ...idsCursosAssincronos];
    console.log("Todos os IDs de cursos encontrados:", todosCursosIds);

    if (todosCursosIds.length === 0) {
      console.log("Nenhum curso encontrado para o utilizador.");
      return res.status(200).json([]);
    }

    const cursosInscritos = await Curso.findAll({
      where: {
        ID_CURSO: {
          [Op.in]: todosCursosIds,
        },
      },
      include: [
        {
          model: CursoSincrono,
          required: false,
        },
        {
          model: CursoAssincrono,
          where: {
            ESTADO: ["Ativo", "Em curso"],
          },
          required: false,
        },
        {
          model: Area,
          attributes: ["NOME"],
          include: [
            {
              model: Categoria,
              as: "Categoria",
              attributes: ["NOME__"],
            },
          ],
        },
        {
          model: Modulos,
          as: "MODULOS",
          required: false,
        },
      ],
    });

    console.log("Cursos inscritos encontrados:", cursosInscritos.length);
    res.status(200).json(cursosInscritos);
  } catch (error) {
    console.error("Erro ao procurar cursos inscritos:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { nome, currentPassword, newPassword, confirmPassword, linkedIn } =
      req.body;

    const utilizador = await Utilizador.findByPk(userId);
    if (!utilizador) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      utilizador.PASSWORD
    );

    if (currentPassword && !isPasswordValid) {
      return res.status(400).json({ message: "Senha atual incorreta" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    if (newPassword && newPassword === confirmPassword) {
      utilizador.PASSWORD = hashedNewPassword;
      sendConfirmationEmail(
        utilizador.NOME,
        utilizador.EMAIL,
        `${URL}/login?login=2`
      );
    } else if (newPassword || confirmPassword) {
      return res
        .status(400)
        .json({ message: "Nova senha e confirmação não coincidem" });
    }

    if (linkedIn) {
      utilizador.LINKEDIN = linkedIn;
    } else if (!linkedIn && utilizador.LINKEDIN) {
      utilizador.LINKEDIN = null;
    }

    if (nome) {
      utilizador.NOME = nome;
    }

    await utilizador.save();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Erro ao atualizar nome e username:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const userIsAdmin = await UtilizadorTemPerfil.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_PERFIL: 3,
      },
    });

    if (!userIsAdmin) {
      return res.status(403).json({
        message: "Acesso negado. Apenas gestores podem ver esta lista.",
      });
    }

    const utilizadores = await Utilizador.findAll({
      attributes: ["ID_UTILIZADOR", "USERNAME", "NOME", "EMAIL", "LINKEDIN"],
      where: {
        ID_UTILIZADOR: { [Op.ne]: req.user.ID_UTILIZADOR },
      },
      include: [
        {
          model: Perfil,
          attributes: ["ID_PERFIL", "PERFIL"],
          through: {
            model: UtilizadorTemPerfil,
            attributes: [],
          },
        },
      ],
    });

    res.status(200).json(utilizadores);
  } catch (error) {
    console.error("Erro ao procurar utilizadores:", error);
    res.status(500).json({ message: error.message });
  }
};

const getProfiles = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;

    const userIsAdmin = await UtilizadorTemPerfil.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_PERFIL: 3,
      },
    });

    if (!userIsAdmin) {
      return res.status(403).json({
        message: "Acesso negado. Apenas gestores podem ver esta lista.",
      });
    }

    const perfis = await Perfil.findAll({
      attributes: ["ID_PERFIL", "PERFIL"],
    });

    res.status(200).json(perfis);
  } catch (error) {
    console.error("Erro ao procurar perfis:", error);
    res.status(500).json({ message: error.message });
  }
};

const changeUser = async (req, res) => {
  try {
    const adminId = req.user.ID_UTILIZADOR;
    const userId = req.params.id;
    const { NOME, EMAIL, LINKEDIN, profileId } = req.body;

    const userIsAdmin = await UtilizadorTemPerfil.findOne({
      where: {
        ID_UTILIZADOR: adminId,
        ID_PERFIL: 3,
      },
    });

    if (!userIsAdmin) {
      return res.status(403).json({
        message: "Acesso negado. Apenas gestores podem atualizar utilizadores.",
      });
    }

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "ID de utilizador inválido" });
    }

    const utilizador = await Utilizador.findByPk(userId);
    if (!utilizador) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    if (NOME) {
      utilizador.NOME = NOME;
    }

    if (LINKEDIN) {
      utilizador.LINKEDIN = LINKEDIN;
    }

    if (EMAIL) {
      const emailExistente = await Utilizador.findOne({
        where: {
          EMAIL: EMAIL,
          ID_UTILIZADOR: { [Op.ne]: userId },
        },
      });

      if (emailExistente) {
        return res.status(400).json({ message: "Email já está em uso" });
      }
      utilizador.EMAIL = EMAIL;
    }

    if (profileId) {
      const perfilExistente = await Perfil.findByPk(profileId);
      if (!perfilExistente) {
        return res.status(404).json({ message: "Perfil não encontrado" });
      }

      const cursos = await CursoSincrono.findAll({
        where: { ID_UTILIZADOR: userId },
      });
      if (cursos.length > 0) {
        return res.status(400).json({
          message:
            "Não é possível alterar o perfil de um formador ou gestor que possui cursos associados.",
        });
      }

      await UtilizadorTemPerfil.update(
        { ID_PERFIL: profileId },
        { where: { ID_UTILIZADOR: userId } }
      );
    }

    await utilizador.save();

    res.status(200).json({
      success: true,
      message: "Utilizador atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar utilizador:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "ID de utilizador inválido" });
    }

    const utilizador = await Utilizador.findByPk(userId, {
      attributes: [
        "ID_UTILIZADOR",
        "USERNAME",
        "NOME",
        "LINKEDIN",
        "DATA_CRIACAO",
        "ULTIMO_LOGIN",
        "EMAIL",
        "XP",
      ],
      include: [
        {
          model: Perfil,
          attributes: ["ID_PERFIL", "PERFIL"],
          through: {
            model: UtilizadorTemPerfil,
            attributes: [],
          },
        },
      ],
    });

    if (!utilizador) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    res.status(200).json(utilizador);
  } catch (error) {
    console.error("Erro ao procurar utilizador:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUserStatistics = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "ID de utilizador inválido" });
    }

    const [
      utilizador,
      cursosSincronosInscritos,
      cursosAssincronosInscritos,
      avaliacaoFinal,
      respostasQuizzes,
    ] = await Promise.all([
      Utilizador.findByPk(userId),

      InscricaoSincrono.findAll({
        where: { ID_UTILIZADOR: userId },
        include: [
          {
            model: CursoSincrono,
            include: [
              {
                model: Curso,
                attributes: ["ID_CURSO", "NOME"],
              },
            ],
          },
        ],
      }),

      InscricaoAssincrono.findAll({
        where: { ID_UTILIZADOR: userId },
        include: [
          {
            model: CursoAssincrono,
            include: [
              {
                model: Curso,
                attributes: ["ID_CURSO", "NOME"],
              },
            ],
          },
        ],
      }),

      AvaliacaoFinalSincrona.findAll({
        where: {
          UTI_ID_UTILIZADOR2: userId,
          NOTA_FINAL: { [Op.ne]: null },
        },
        attributes: ["NOTA_FINAL"],
      }),

      RespostaQuizAssincrono.findAll({
        where: {
          ID_UTILIZADOR: userId,
        },
        attributes: ["NOTA"],
      }),
    ]);

    if (!utilizador) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    let notaMediaCompleta = 0;
    let totalAvaliacoes = 0;
    let somaNotas = 0;

    if (avaliacaoFinal.length > 0) {
      const somaDasNotas = avaliacaoFinal.reduce(
        (soma, submissao) => soma + parseFloat(submissao.NOTA_FINAL),
        0
      );
      somaNotas += somaDasNotas;
      totalAvaliacoes += avaliacaoFinal.length;
    }

    if (respostasQuizzes.length > 0) {
      const somaQuizzesConvertida = respostasQuizzes.reduce(
        (soma, resposta) => {
          const notaConvertida = (parseFloat(resposta.NOTA) * 20) / 100;
          return soma + notaConvertida;
        },
        0
      );
      somaNotas += somaQuizzesConvertida;
      totalAvaliacoes += respostasQuizzes.length;
    }

    if (totalAvaliacoes > 0) {
      notaMediaCompleta = somaNotas / totalAvaliacoes;
    }

    const cursosIds = [];
    const progressoExistente = await ProgressoModulo.findAll({
      attributes: ["ID_CURSO"],
      where: {
        ID_UTILIZADOR: userId,
      },
      group: ["ID_CURSO"],
    });

    const cursosIdsFromProgresso = progressoExistente
      .map((p) => p.ID_CURSO)
      .filter(Boolean);
    console.log(
      "IDs recuperados da tabela de progresso:",
      cursosIdsFromProgresso
    );

    if (cursosIdsFromProgresso.length > 0) {
      cursosIds.push(...cursosIdsFromProgresso);
      console.log("IDs de cursos atualizados:", cursosIds);
    }

    console.log(cursosIds ? cursosIds : "Sem cursos IDS");

    let cursosCompletados = 0;
    if (cursosIds.length > 0) {
      const {
        ProgressoModulo,
        Modulos,
        QuizAssincrono,
        RespostaQuizAssincrono,
      } = require("../models/index.js");

      for (const cursoId of cursosIds) {
        console.log(
          `Verificando completude do curso ${cursoId} para usuário ${userId}...`
        );

        const totalModulos = await Modulos.count({
          where: { ID_CURSO: cursoId },
        });

        const modulosCompletos = await ProgressoModulo.count({
          where: {
            ID_UTILIZADOR: userId,
            ID_CURSO: cursoId,
            COMPLETO: true,
          },
        });

        const quiz = await QuizAssincrono.findOne({
          where: { ID_CURSO: cursoId, ATIVO: true },
        });

        let quizCompleto = true;

        if (quiz) {
          const respostaQuiz = await RespostaQuizAssincrono.findOne({
            where: {
              ID_UTILIZADOR: userId,
              ID_QUIZ: quiz.ID_QUIZ,
            },
          });

          quizCompleto = !!respostaQuiz;

          console.log(
            `Curso ${cursoId}: Quiz ${quiz.ID_QUIZ} ${quizCompleto ? "completado" : "não completado"}`
          );
        }

        if (
          totalModulos > 0 &&
          modulosCompletos === totalModulos &&
          quizCompleto
        ) {
          console.log(
            `Curso ${cursoId} COMPLETADO: ${modulosCompletos}/${totalModulos} módulos e quiz ${quizCompleto ? "completo" : "N/A"}`
          );
          cursosCompletados++;
        } else {
          console.log(
            `Curso ${cursoId} NÃO completado: ${modulosCompletos}/${totalModulos} módulos e quiz ${quizCompleto ? "completo" : "incompleto/não existe"}`
          );
        }
      }
    }

    const totalCursos =
      cursosSincronosInscritos.length + cursosAssincronosInscritos.length;

    const estatisticas = {
      xp: utilizador.XP || 0,
      notaMedia: parseFloat(notaMediaCompleta.toFixed(1)),
      totalCursos: totalCursos,
      cursosCompletados: cursosCompletados,
      totalAvaliacoes: totalAvaliacoes,
      cursosAtivos: totalCursos - cursosCompletados,
      detalhesNotas: {
        avaliacoesFinais: {
          count: avaliacaoFinal.length,
          mediaOriginal:
            avaliacaoFinal.length > 0
              ? parseFloat(
                  (
                    avaliacaoFinal.reduce(
                      (soma, s) => soma + parseFloat(s.NOTA_FINAL),
                      0
                    ) / avaliacaoFinal.length
                  ).toFixed(1)
                )
              : 0,
        },
        quizzes: {
          count: respostasQuizzes.length,
          mediaOriginal:
            respostasQuizzes.length > 0
              ? parseFloat(
                  (
                    respostasQuizzes.reduce(
                      (soma, r) => soma + parseFloat(r.NOTA),
                      0
                    ) / respostasQuizzes.length
                  ).toFixed(1)
                )
              : 0,
          mediaConvertida:
            respostasQuizzes.length > 0
              ? parseFloat(
                  (
                    respostasQuizzes.reduce(
                      (soma, r) => soma + (parseFloat(r.NOTA) * 20) / 100,
                      0
                    ) / respostasQuizzes.length
                  ).toFixed(1)
                )
              : 0,
        },
      },
    };

    console.log(
      `Estatísticas para usuário ${userId}: Total=${totalCursos}, Completos=${cursosCompletados}, Ativos=${totalCursos - cursosCompletados}`
    );

    res.status(200).json(estatisticas);
  } catch (error) {
    console.error("Erro ao procurar estatísticas do utilizador:", error);
    res.status(500).json({ message: error.message });
  }
};

const addXPToUserInternal = async (
  userId,
  xpAmount,
  reason = "Atividade completada"
) => {
  try {
    const utilizador = await Utilizador.findByPk(userId);
    if (!utilizador) {
      console.log(`Utilizador ${userId} não encontrado para atualizar XP`);
      return false;
    }

    const xpAtual = utilizador.XP || 0;
    const novoXP = xpAtual + parseInt(xpAmount);

    await utilizador.update({ XP: novoXP });
    return {
      xpAnterior: xpAtual,
      xpNovo: novoXP,
      xpAdicionado: parseInt(xpAmount),
    };
  } catch (error) {
    console.error("Erro ao adicionar XP:", error);
    return false;
  }
};

const XP_VALUES = {
  MODULO_COMPLETO: 10,
  CURSO_COMPLETO: 50,
  NOTA_EXCELENTE: 25,
  NOTA_BOA: 15,
  NOTA_SATISFATORIA: 5,
};

const completeModule = async (req, res) => {
  try {
    const userId = req.user?.ID_UTILIZADOR || req.body.userId;
    const { cursoId, moduloId } = req.body;

    const modulo = await Modulos.findOne({
      where: {
        ID_MODULO: moduloId,
        ID_CURSO: cursoId,
      },
    });

    if (!modulo) {
      return res.status(404).json({
        success: false,
        message: "Módulo não encontrado",
      });
    }

    const { ProgressoModulo } = require("../models/index.js");
    let progressoExistente = await ProgressoModulo.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: cursoId,
        ID_MODULO: moduloId,
      },
    });

    let xpGanho = 0;
    let jaCompleto = false;
    let cursoCompleto = false;

    if (progressoExistente) {
      if (progressoExistente.COMPLETO) {
        jaCompleto = true;
        console.log(`Módulo ${moduloId} já estava completo`);
      } else {
        await progressoExistente.update({
          COMPLETO: true,
          DATA_COMPLETO: new Date(),
        });
        xpGanho += XP_VALUES.MODULO_COMPLETO;
        console.log(`Módulo ${moduloId} marcado como completo`);
      }
    } else {
      await ProgressoModulo.create({
        ID_UTILIZADOR: userId,
        ID_CURSO: cursoId,
        ID_MODULO: moduloId,
        COMPLETO: true,
        DATA_COMPLETO: new Date(),
      });
      xpGanho += XP_VALUES.MODULO_COMPLETO;
      console.log(`Novo progresso criado para módulo ${moduloId}`);
    }

    if (!jaCompleto) {
      const totalModulos = await Modulos.count({
        where: { ID_CURSO: cursoId },
      });

      const modulosCompletos = await ProgressoModulo.count({
        where: {
          ID_UTILIZADOR: userId,
          ID_CURSO: cursoId,
          COMPLETO: true,
        },
      });

      console.log(
        `Progresso do curso ${cursoId}: ${modulosCompletos}/${totalModulos} módulos`
      );

      if (totalModulos > 0 && modulosCompletos === totalModulos) {
        cursoCompleto = true;
        xpGanho += XP_VALUES.CURSO_COMPLETO;
        console.log(
          `Curso ${cursoId} COMPLETADO! Bônus de ${XP_VALUES.CURSO_COMPLETO} XP`
        );
      }
    }

    let resultadoXP = null;
    if (xpGanho > 0) {
      const reason = cursoCompleto
        ? `Módulo completado + Curso "${modulo.NOME}" finalizado`
        : `Módulo "${modulo.NOME}" completado`;

      resultadoXP = await addXPToUserInternal(userId, xpGanho, reason);
    }

    res.status(200).json({
      success: true,
      message: jaCompleto
        ? "Módulo já estava completo"
        : "Módulo completado com sucesso",
      xpGanho,
      cursoCompleto,
      jaCompleto,
      resultadoXP,
    });
  } catch (error) {
    console.error("Erro ao completar módulo:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateEvaluationGrade = async (req, res) => {
  try {
    const { submissaoId, nota } = req.body;
    const professorId = req.user.ID_UTILIZADOR;

    const isProfessor = await UtilizadorTemPerfil.findOne({
      where: {
        ID_UTILIZADOR: professorId,
        ID_PERFIL: { [Op.in]: [2, 3] },
      },
    });

    const { SubmissaoAvaliacao } = require("../models/index.js");
    const submissao = await SubmissaoAvaliacao.findByPk(submissaoId);

    if (!submissao) {
      return res.status(404).json({
        success: false,
        message: "Submissão não encontrada",
      });
    }

    const notaAnterior = submissao.NOTA;
    const notaNumerica = parseFloat(nota);

    await submissao.update({
      NOTA: notaNumerica,
      DATA_AVALIACAO: new Date(),
    });

    let xpGanho = 0;
    if (notaAnterior === null) {
      if (notaNumerica >= 18) {
        xpGanho = XP_VALUES.NOTA_EXCELENTE;
        console.log(`Nota excelente (${notaNumerica}/20)! ${xpGanho} XP`);
      } else if (notaNumerica >= 15) {
        xpGanho = XP_VALUES.NOTA_BOA;
        console.log(`Boa nota (${notaNumerica}/20)! ${xpGanho} XP`);
      } else if (notaNumerica >= 10) {
        xpGanho = XP_VALUES.NOTA_SATISFATORIA;
        console.log(`Nota satisfatória (${notaNumerica}/20)! ${xpGanho} XP`);
      }

      if (xpGanho > 0) {
        const resultadoXP = await addXPToUserInternal(
          submissao.ID_UTILIZADOR,
          xpGanho,
          `Avaliação com nota ${notaNumerica}/20`
        );

        res.status(200).json({
          success: true,
          message: "Nota atualizada e XP atribuído com sucesso",
          nota: notaNumerica,
          xpGanho,
          resultadoXP,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Nota atualizada com sucesso",
          nota: notaNumerica,
          xpGanho: 0,
        });
      }
    } else {
      res.status(200).json({
        success: true,
        message: "Nota atualizada (sem XP adicional - já havia nota anterior)",
        nota: notaNumerica,
        xpGanho: 0,
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar nota:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getNotaMediaCompleta = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;

    const { SubmissaoAvaliacao } = require("../models/index.js");
    const submissoesTrabalhos = await SubmissaoAvaliacao.findAll({
      where: {
        ID_UTILIZADOR: userId,
        NOTA: { [Op.ne]: null },
      },
      attributes: ["NOTA"],
    });

    const { RespostaQuizAssincrono } = require("../models/index.js");
    const respostasQuizzes = await RespostaQuizAssincrono.findAll({
      where: {
        ID_UTILIZADOR: userId,
      },
      attributes: ["NOTA"],
    });

    let notaMediaGeral = 0;
    let totalAvaliacoes = 0;
    let somaNotas = 0;

    if (submissoesTrabalhos.length > 0) {
      const somaTrabalhos = submissoesTrabalhos.reduce(
        (soma, submissao) => soma + parseFloat(submissao.NOTA),
        0
      );

      somaNotas += somaTrabalhos;
      totalAvaliacoes += submissoesTrabalhos.length;
    }

    if (respostasQuizzes.length > 0) {
      const somaQuizzesConvertida = respostasQuizzes.reduce(
        (soma, resposta) => {
          const notaConvertida = (parseFloat(resposta.NOTA) * 20) / 100;
          return soma + notaConvertida;
        },
        0
      );

      somaNotas += somaQuizzesConvertida;
      totalAvaliacoes += respostasQuizzes.length;
    }

    if (totalAvaliacoes > 0) {
      notaMediaGeral = somaNotas / totalAvaliacoes;
    }

    const estatisticas = {
      notaMediaGeral: parseFloat(notaMediaGeral.toFixed(1)),
      totalAvaliacoes: totalAvaliacoes,
      trabalhos: {
        count: submissoesTrabalhos.length,
        media:
          submissoesTrabalhos.length > 0
            ? parseFloat(
                (
                  submissoesTrabalhos.reduce(
                    (soma, s) => soma + parseFloat(s.NOTA),
                    0
                  ) / submissoesTrabalhos.length
                ).toFixed(1)
              )
            : 0,
        escala: "0-20",
      },
      quizzes: {
        count: respostasQuizzes.length,
        media:
          respostasQuizzes.length > 0
            ? parseFloat(
                (
                  respostasQuizzes.reduce((soma, r) => {
                    const notaConvertida = (parseFloat(r.NOTA) * 20) / 100;
                    return soma + notaConvertida;
                  }, 0) / respostasQuizzes.length
                ).toFixed(1)
              )
            : 0,
        escala: "0-20",
      },
    };

    res.status(200).json(estatisticas);
  } catch (error) {
    console.error("Erro ao calcular nota média completa:", error);
    res.status(500).json({
      message: "Erro ao calcular nota média",
      error: error.message,
    });
  }
};

const addTeacher = async (req, res) => {
  try {
    const adminId = req.user.ID_UTILIZADOR;
    const { NOME, EMAIL } = req.body;

    const userIsAdmin = await UtilizadorTemPerfil.findOne({
      where: {
        ID_UTILIZADOR: adminId,
        ID_PERFIL: 3,
      },
    });

    if (!userIsAdmin) {
      return res.status(403).json({
        message: "Acesso negado. Apenas gestores podem adicionar formadores.",
      });
    }

    if (!NOME || !EMAIL) {
      return res.status(400).json({
        message: "Nome e email são obrigatórios",
      });
    }

    const emailExistente = await Utilizador.findOne({
      where: { EMAIL: EMAIL },
    });

    if (emailExistente) {
      return res.status(400).json({
        message: "Este email já está registado na plataforma",
      });
    }

    const USERNAME = EMAIL.split("@")[0];
    const PASSWORD = crypto.randomBytes(12).toString("hex");
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const utilizador = await Utilizador.create({
      USERNAME: USERNAME,
      NOME: NOME,
      PASSWORD: hashedPassword,
      EMAIL: EMAIL,
      LINKEDIN: null,
      VERIFICATIONTOKEN: verificationToken,
      VERIFICATIONTOKENEXPIRES: verificationExpires,
      ESTA_VERIFICADO: false,
      PRIMEIRO_LOGIN: true,
      DATA_CRIACAO: new Date(),
    });

    await UtilizadorTemPerfil.create({
      ID_UTILIZADOR: utilizador.ID_UTILIZADOR,
      ID_PERFIL: 2,
    });

    await EmailFormadorNovo(
      utilizador.USERNAME,
      utilizador.NOME,
      utilizador.EMAIL,
      PASSWORD,
      verificationToken
    );

    res.status(201).json({
      success: true,
      message: "Formador adicionado com sucesso! Email de boas-vindas enviado.",
      utilizador: {
        ID_UTILIZADOR: utilizador.ID_UTILIZADOR,
        USERNAME: utilizador.USERNAME,
        NOME: utilizador.NOME,
        EMAIL: utilizador.EMAIL,
        PERFIL: "Formador",
      },
    });
  } catch (error) {
    console.error("Erro ao adicionar formador:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
};

const getNotaMediaAvaliacoesFinais = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;

    const { AvaliacaoFinalSincrona } = require("../models/index.js");
    const avaliacoesFinais = await AvaliacaoFinalSincrona.findAll({
      where: {
        UTI_ID_UTILIZADOR2: userId,
      },
      attributes: ["NOTA_FINAL", "DATA_AVALIACAO"],
    });

    let notaMediaFinal = 0;
    let totalAvaliacoesFinais = avaliacoesFinais.length;

    if (totalAvaliacoesFinais > 0) {
      const somaNotasFinais = avaliacoesFinais.reduce(
        (soma, avaliacao) => soma + parseFloat(avaliacao.NOTA_FINAL),
        0
      );
      notaMediaFinal = somaNotasFinais / totalAvaliacoesFinais;
    }

    const estatisticas = {
      notaMediaFinal: parseFloat(notaMediaFinal.toFixed(1)),
      totalAvaliacoesFinais: totalAvaliacoesFinais,
      escala: "0-20",
      cursosCompletados: totalAvaliacoesFinais,
    };

    res.status(200).json(estatisticas);
  } catch (error) {
    console.error("Erro ao procurar nota média das avaliações finais:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeachers,
  getCursosAssociados,
  inscreverEmCurso,
  verificarInscricao,
  getCursosInscritos,
  updateUser,
  getUsers,
  getProfiles,
  changeUser,
  getUser,
  getUserStatistics,
  completeModule,
  updateEvaluationGrade,
  addXPToUserInternal,
  getNotaMediaCompleta,
  addTeacher,
  getNotaMediaAvaliacoesFinais,
};
