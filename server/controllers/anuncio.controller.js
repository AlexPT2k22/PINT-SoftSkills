const {
  Anuncio,
  Utilizador,
  UtilizadorTemPerfil,
  Curso,
} = require("../models/index.js");
const { notifyAllEnrolled } = require("./notificacao.controller.js");

// Buscar anúncios de um curso
const getAnunciosByCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: anuncios } = await Anuncio.findAndCountAll({
      where: {
        ID_CURSO: cursoId,
      },
      include: [
        {
          model: Utilizador,
          attributes: ["NOME", "USERNAME"],
        },
      ],
      order: [["DATA_CRIACAO", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.status(200).json({
      success: true,
      anuncios,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        hasMore: offset + anuncios.length < count,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

const createAnuncio = async (req, res) => {
  const { titulo, conteudo, cursoId } = req.body;
  const userId = req.user.ID_UTILIZADOR;

  if (!titulo || !conteudo || !cursoId) {
    return res.status(400).json({
      success: false,
      message: "Título, conteúdo e ID do curso são obrigatórios.",
    });
  }

  try {
    const user = await UtilizadorTemPerfil.findByPk(userId);
    const curso = await Curso.findByPk(cursoId);

    if (user.ID_PERFIL === 1) {
      return res.status(500).json({
        success: false,
        message:
          'Apenas utilizadores com perfil de "formador ou gestor" podem criar anúncios.',
      });
    }

    const novoAnuncio = await Anuncio.create({
      ID_CURSO: cursoId,
      ID_UTILIZADOR: userId,
      TITULO: titulo,
      CONTEUDO: conteudo,
      DATA_CRIACAO: new Date(),
    });

    const formador = await Utilizador.findByPk(userId);
    const formadorNome = formador?.NOME || formador?.USERNAME || "Formador";

    await notifyAllEnrolled(
      cursoId,
      `Novo Anúncio: ${titulo}`,
      `Um novo anúncio foi publicado no curso ${curso.NOME}:\n"${titulo}"\n${conteudo.substring(0, 100)}${conteudo.length > 100 ? "..." : ""}`,
      "NOVO_ANUNCIO",
      {
        anuncio: novoAnuncio,
        formadorNome: formadorNome,
      }
    );

    res.status(201).json({
      success: true,
      anuncio: novoAnuncio,
    });
  } catch (error) {
    console.error("Erro ao criar anúncio:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Editar anúncio
const updateAnuncio = async (req, res) => {
  const { anuncioId } = req.params;
  const { titulo, conteudo } = req.body;
  const userId = req.user.ID_UTILIZADOR;

  if (!titulo || !conteudo) {
    return res.status(400).json({
      success: false,
      message: "Título e conteúdo são obrigatórios.",
    });
  }

  try {
    // Verificar se o anúncio existe
    const anuncio = await Anuncio.findByPk(anuncioId);
    if (!anuncio) {
      return res.status(404).json({
        success: false,
        message: "Anúncio não encontrado.",
      });
    }

    // Verificar se o usuário é o autor do anúncio
    if (anuncio.ID_UTILIZADOR !== userId) {
      // Ou se é gestor
      const userProfile = await UtilizadorTemPerfil.findOne({
        where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
      });

      if (!userProfile) {
        return res.status(403).json({
          success: false,
          message: "Você não tem permissão para editar este anúncio.",
        });
      }
    }

    // Atualizar anúncio
    await anuncio.update({
      TITULO: titulo,
      CONTEUDO: conteudo,
    });

    res.status(200).json({
      success: true,
      anuncio,
    });
  } catch (error) {
    console.error("Erro ao editar anúncio:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Excluir anúncio
const deleteAnuncio = async (req, res) => {
  const { anuncioId } = req.params;
  const userId = req.user.ID_UTILIZADOR;

  try {
    // Verificar se o anúncio existe
    const anuncio = await Anuncio.findByPk(anuncioId);
    if (!anuncio) {
      return res.status(404).json({
        success: false,
        message: "Anúncio não encontrado.",
      });
    }

    // Verificar se o usuário é o autor do anúncio
    if (anuncio.ID_UTILIZADOR !== userId) {
      // Ou se é gestor
      const userProfile = await UtilizadorTemPerfil.findOne({
        where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
      });

      if (!userProfile) {
        return res.status(403).json({
          success: false,
          message: "Você não tem permissão para excluir este anúncio.",
        });
      }
    }

    // Excluir anúncio
    await anuncio.destroy();

    res.status(200).json({
      success: true,
      message: "Anúncio excluído com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir anúncio:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

module.exports = {
  getAnunciosByCurso,
  createAnuncio,
  updateAnuncio,
  deleteAnuncio,
};
