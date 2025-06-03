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
} = require("../models/index.js");
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

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
          }, // filtra os perfis de formador e gestor
          attributes: [], // não traz os dados do perfil, só usa para filtrar
          through: { attributes: [] }, // não traz dados da tabela intermédia
        },
      ],
    });
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Erro ao buscar os professores:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCursosAssociados = async (req, res) => {
  try {
    const id = req.user.ID_UTILIZADOR; // ID do utilizador

    // Look for synchronous courses where this user is the teacher
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
    console.error("Erro ao buscar os cursos associados:", error);
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

    // First get the basic course info to determine type if not provided
    const cursoBase = await Curso.findByPk(courseId);
    if (!cursoBase) {
      return res.status(404).json({
        success: false,
        message: "Curso não encontrado",
      });
    }

    // Handle based on course type
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
    // Verificar se o curso existe
    const curso = await CursoSincrono.findByPk(courseId);
    if (!curso) {
      return res.status(404).json({
        success: false,
        message: "Curso síncrono não encontrado",
      });
    }

    // Verificar se o usuário já está inscrito
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

    // Verificar se há vagas disponíveis
    if (curso.VAGAS <= 0) {
      return res.status(400).json({
        success: false,
        message: "Não há vagas disponíveis neste curso síncrono",
      });
    }

    // Criar nova inscrição
    const novaInscricao = await InscricaoSincrono.create({
      ID_UTILIZADOR: userId,
      ID_CURSO_SINCRONO: courseId,
      DATA_INSCRICAO: new Date(),
      DATA_LIMITE_INSCRICAO_S: curso.DATA_INICIO,
      FORMULARIO_INSCRICAO: req.body.formulario || null,
    });

    // Atualizar número de vagas
    await curso.update({
      VAGAS: curso.VAGAS - 1,
    });

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
    // Verificar se o curso existe
    const curso = await CursoAssincrono.findOne({
      where: { ID_CURSO: courseId },
    });

    if (!curso) {
      return res.status(404).json({
        success: false,
        message: "Curso assíncrono não encontrado",
      });
    }

    // Verificar se o usuário já está inscrito
    const inscricaoExistente = await InscricaoAssincrono.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO_ASSINCRONO: curso.ID_CURSO_ASSINCRONO, // Use the correct ID from curso
      },
    });

    if (inscricaoExistente) {
      return res.status(400).json({
        success: false,
        message: "Você já está inscrito neste curso assíncrono",
      });
    }

    // Criar nova inscrição
    const novaInscricao = await InscricaoAssincrono.create({
      ID_UTILIZADOR: userId,
      ID_CURSO_ASSINCRONO: curso.ID_CURSO_ASSINCRONO,
      DATA_INSCRICAO: new Date(),
      ESTADO: "Ativo",
    });

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

    // Check asynchronous course enrollment
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
          attributes: [], // Não precisamos dos dados da inscrição, só filtrar
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
    console.error("Erro ao buscar cursos inscritos:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { nome, currentPassword, newPassword, confirmPassword, linkedIn } =
      req.body;

    // Verifica se o utilizador existe
    const utilizador = await Utilizador.findByPk(userId);
    if (!utilizador) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      utilizador.PASSWORD
    );

    // Verifica se a senha atual está correta
    if (currentPassword && !isPasswordValid) {
      return res.status(400).json({ message: "Senha atual incorreta" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha se fornecida
    if (newPassword && newPassword === confirmPassword) {
      utilizador.PASSWORD = hashedNewPassword;
    } else if (newPassword || confirmPassword) {
      return res
        .status(400)
        .json({ message: "Nova senha e confirmação não coincidem" });
    }

    if (linkedIn) {
      utilizador.LINKEDIN = linkedIn;
    } else if (!linkedIn && utilizador.LINKEDIN) {
      // Se o LinkedIn não for fornecido, remove o link existente
      utilizador.LINKEDIN = null;
    }

    // Atualiza o nome se fornecido
    if (nome) {
      utilizador.NOME = nome;
    }

    // Salva as alterações no utilizador
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
        ID_UTILIZADOR: { [Op.ne]: req.user.ID_UTILIZADOR }, // Exclui o utilizador atual
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
    console.error("Erro ao buscar utilizadores:", error);
    res.status(500).json({ message: error.message });
  }
};

const getProfiles = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;

    // Verifica se o utilizador tem o perfil de gestor
    const userIsAdmin = await UtilizadorTemPerfil.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_PERFIL: 3, // ID do perfil de gestor
      },
    });

    if (!userIsAdmin) {
      return res.status(403).json({
        message: "Acesso negado. Apenas gestores podem ver esta lista.",
      });
    }

    // Busca todos os perfis
    const perfis = await Perfil.findAll({
      attributes: ["ID_PERFIL", "PERFIL"],
    });

    res.status(200).json(perfis);
  } catch (error) {
    console.error("Erro ao buscar perfis:", error);
    res.status(500).json({ message: error.message });
  }
};

const changeUser = async (req, res) => {
  try {
    const adminId = req.user.ID_UTILIZADOR;
    const userId = req.params.id;
    const { NOME, EMAIL, LINKEDIN, profileId } = req.body;

    // Verifica se o utilizador tem o perfil de gestor
    const userIsAdmin = await UtilizadorTemPerfil.findOne({
      where: {
        ID_UTILIZADOR: adminId,
        ID_PERFIL: 3, // ID do perfil de gestor
      },
    });

    if (!userIsAdmin) {
      return res.status(403).json({
        message: "Acesso negado. Apenas gestores podem atualizar utilizadores.",
      });
    }
    // Verifica se o ID do utilizador a ser atualizado é válido
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "ID de utilizador inválido" });
    }

    // Verifica se o utilizador existe
    const utilizador = await Utilizador.findByPk(userId);
    if (!utilizador) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    // Atualiza o nome e username
    if (NOME) {
      utilizador.NOME = NOME;
    }

    if (LINKEDIN) {
      utilizador.LINKEDIN = LINKEDIN;
    }

    if (EMAIL) {
      // Verifica se o email já está em uso por outro utilizador
      const emailExistente = await Utilizador.findOne({
        where: {
          EMAIL: EMAIL,
          ID_UTILIZADOR: { [Op.ne]: userId }, // Exclui o utilizador atual
        },
      });

      if (emailExistente) {
        return res.status(400).json({ message: "Email já está em uso" });
      }
      utilizador.EMAIL = EMAIL;
    }

    // Atualiza o perfil se fornecido
    if (profileId) {
      const perfilExistente = await Perfil.findByPk(profileId);
      if (!perfilExistente) {
        return res.status(404).json({ message: "Perfil não encontrado" });
      }
      await UtilizadorTemPerfil.update(
        { ID_PERFIL: profileId },
        { where: { ID_UTILIZADOR: userId } }
      );
    }

    // Salva as alterações no utilizador
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

    // Verifica se o ID do utilizador é válido
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "ID de utilizador inválido" });
    }

    // Busca o utilizador pelo ID
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
    console.error("Erro ao buscar utilizador:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUserStatistics = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verifica se o ID do utilizador é válido
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "ID de utilizador inválido" });
    }

    // Buscar o utilizador
    const utilizador = await Utilizador.findByPk(userId);
    if (!utilizador) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    // 1. Buscar cursos síncronos inscritos
    const cursosSincronosInscritos = await InscricaoSincrono.findAll({
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
    });

    // 2. Buscar cursos assíncronos inscritos
    const cursosAssincronosInscritos = await InscricaoAssincrono.findAll({
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
    });

    // 3. Total de cursos
    const totalCursos =
      cursosSincronosInscritos.length + cursosAssincronosInscritos.length;

    // 4. Buscar todas as submissões de avaliações do utilizador para calcular nota média
    const { SubmissaoAvaliacao } = require("../models/index.js");
    const submissoes = await SubmissaoAvaliacao.findAll({
      where: {
        ID_UTILIZADOR: userId,
        NOTA: { [Op.ne]: null }, // Só submissões que já foram avaliadas
      },
      attributes: ["NOTA"],
    });

    // Calcular nota média
    let notaMedia = 0;
    if (submissoes.length > 0) {
      const somaNotas = submissoes.reduce(
        (soma, submissao) => soma + parseFloat(submissao.NOTA),
        0
      );
      notaMedia = parseFloat((somaNotas / submissoes.length).toFixed(1));
    }

    // 5. Extrair IDs dos cursos de forma mais robusta
    const { ProgressoModulo, Modulos } = require("../models/index.js");

    // Tentar diferentes formas de extrair os IDs
    let cursosIdsSincronos = [];
    let cursosIdsAssincronos = [];

    // Para cursos síncronos
    cursosSincronosInscritos.forEach((inscricao) => {
      // Tentar diferentes caminhos para o ID do curso
      let cursoId = null;
      if (inscricao.CursoSincrono?.Curso?.ID_CURSO) {
        cursoId = inscricao.CursoSincrono.Curso.ID_CURSO;
      } else if (inscricao.CursoSincrono?.ID_CURSO) {
        cursoId = inscricao.CursoSincrono.ID_CURSO;
      } else if (inscricao.ID_CURSO_SINCRONO) {
        // Se não conseguir pelo include, usar o ID do curso síncrono diretamente
        cursoId = inscricao.ID_CURSO_SINCRONO;
      }

      if (cursoId) {
        cursosIdsSincronos.push(cursoId);
      }
    });

    // Para cursos assíncronos
    cursosAssincronosInscritos.forEach((inscricao) => {
      // Tentar diferentes caminhos para o ID do curso
      let cursoId = null;
      if (inscricao.CursoAssincrono?.Curso?.ID_CURSO) {
        cursoId = inscricao.CursoAssincrono.Curso.ID_CURSO;
      } else if (inscricao.CursoAssincrono?.ID_CURSO) {
        cursoId = inscricao.CursoAssincrono.ID_CURSO;
      }

      if (cursoId) {
        cursosIdsAssincronos.push(cursoId);
      }
    });

    // Se ainda não conseguiu os IDs, tentar uma abordagem alternativa
    if (
      cursosIdsSincronos.length === 0 &&
      cursosSincronosInscritos.length > 0
    ) {
      for (const inscricao of cursosSincronosInscritos) {
        const cursoSincrono = await CursoSincrono.findByPk(
          inscricao.ID_CURSO_SINCRONO
        );
        if (cursoSincrono && cursoSincrono.ID_CURSO) {
          cursosIdsSincronos.push(cursoSincrono.ID_CURSO);
        }
      }
    }

    if (
      cursosIdsAssincronos.length === 0 &&
      cursosAssincronosInscritos.length > 0
    ) {
      for (const inscricao of cursosAssincronosInscritos) {
        const cursoAssincrono = await CursoAssincrono.findByPk(
          inscricao.ID_CURSO_ASSINCRONO
        );
        if (cursoAssincrono && cursoAssincrono.ID_CURSO) {
          cursosIdsAssincronos.push(cursoAssincrono.ID_CURSO);
        }
      }
    }

    const cursosIds = [...cursosIdsSincronos, ...cursosIdsAssincronos];

    let cursosCompletados = 0;

    for (const cursoId of cursosIds) {
      // Contar total de módulos do curso
      const totalModulos = await Modulos.count({
        where: { ID_CURSO: cursoId },
      });

      if (totalModulos === 0) {
        console.log(`Curso ${cursoId} não tem módulos registados`);
        continue;
      }

      // Contar módulos completados pelo utilizador
      const modulosCompletos = await ProgressoModulo.count({
        where: {
          ID_UTILIZADOR: userId,
          ID_CURSO: cursoId,
          COMPLETO: true,
        },
      });

      const detalhe = {
        cursoId,
        totalModulos,
        modulosCompletos,
        percentualCompleto:
          totalModulos > 0
            ? Math.round((modulosCompletos / totalModulos) * 100)
            : 0,
        completo: totalModulos > 0 && modulosCompletos === totalModulos,
      };

      // Se completou todos os módulos, conta como curso completado
      if (totalModulos > 0 && modulosCompletos === totalModulos) {
        cursosCompletados++;
      }
    }

    //console.log(`\nTotal de cursos completados: ${cursosCompletados}`);
    //console.log("Detalhes de completude:", detalhesCompletude);

    // 6. XP atual do utilizador
    const xpAtual = utilizador.XP || 0;

    const estatisticas = {
      xp: xpAtual,
      notaMedia: notaMedia,
      totalCursos: totalCursos,
      cursosCompletados: cursosCompletados,
      totalAvaliacoes: submissoes.length,
      cursosAtivos: totalCursos - cursosCompletados,
    };

    res.status(200).json(estatisticas);
  } catch (error) {
    console.error("Erro ao buscar estatísticas do utilizador:", error);
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

    console.log(
      `✅ ${xpAmount} XP adicionado ao utilizador ${userId}: ${xpAtual} → ${novoXP} (${reason})`
    );
    return {
      xpAnterior: xpAtual,
      xpNovo: novoXP,
      xpAdicionado: parseInt(xpAmount),
    };
  } catch (error) {
    console.error("❌ Erro ao adicionar XP:", error);
    return false;
  }
};

const XP_VALUES = {
  MODULO_COMPLETO: 10, // XP por completar um módulo
  CURSO_COMPLETO: 50, // XP bônus por completar curso inteiro
  NOTA_EXCELENTE: 25, // XP bônus por nota >= 18
  NOTA_BOA: 15, // XP bônus por nota >= 15
  NOTA_SATISFATORIA: 5, // XP bônus por nota >= 10
};

const completeModule = async (req, res) => {
  try {
    const userId = req.user?.ID_UTILIZADOR || req.body.userId;
    const { cursoId, moduloId } = req.body;

    console.log(
      `Tentando completar módulo ${moduloId} do curso ${cursoId} para utilizador ${userId}`
    );

    // Verificar se o módulo existe
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

    // Verificar se já existe progresso para este módulo
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
        // Marcar como completo
        await progressoExistente.update({
          COMPLETO: true,
          DATA_COMPLETO: new Date(),
        });
        xpGanho += XP_VALUES.MODULO_COMPLETO;
        console.log(`Módulo ${moduloId} marcado como completo`);
      }
    } else {
      // Criar novo registo de progresso
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

    // Verificar se completou o curso inteiro (só se não estava já completo)
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

    // Atualizar XP do utilizador
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

    console.log(`📝 Atualizando nota da submissão ${submissaoId} para ${nota}`);

    // Verificar se o utilizador é um professor
    const isProfessor = await UtilizadorTemPerfil.findOne({
      where: {
        ID_UTILIZADOR: professorId,
        ID_PERFIL: { [Op.in]: [2, 3] }, // ID do perfil de formador
      },
    });

    // Buscar a submissão
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

    // Atualizar a nota
    await submissao.update({
      NOTA: notaNumerica,
      DATA_AVALIACAO: new Date(),
    });

    // Calcular XP por nota (só se não tinha nota antes)
    let xpGanho = 0;
    if (notaAnterior === null) {
      if (notaNumerica >= 18) {
        xpGanho = XP_VALUES.NOTA_EXCELENTE;
        console.log(`🌟 Nota excelente (${notaNumerica}/20)! ${xpGanho} XP`);
      } else if (notaNumerica >= 15) {
        xpGanho = XP_VALUES.NOTA_BOA;
        console.log(`⭐ Boa nota (${notaNumerica}/20)! ${xpGanho} XP`);
      } else if (notaNumerica >= 10) {
        xpGanho = XP_VALUES.NOTA_SATISFATORIA;
        console.log(`✅ Nota satisfatória (${notaNumerica}/20)! ${xpGanho} XP`);
      }

      // Dar XP ao utilizador
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
    console.error("❌ Erro ao atualizar nota:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
};
