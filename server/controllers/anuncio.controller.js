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

    if (user.ID_PERFIL !== 2) {
      return res.status(500).json({
        success: false,
        message:
          'Apenas utilizadores com perfil de "formador" podem criar anúncios.',
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
      `Um novo anúncio foi publicado no curso ${curso.NOME}:\n\n"${titulo}"\n\n${conteudo.substring(0, 100)}${conteudo.length > 100 ? "..." : ""}`,
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

module.exports = {
  getAnunciosByCurso,
  createAnuncio,
};
