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
};
