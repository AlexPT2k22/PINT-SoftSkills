const {
  ForumSolicitacao,
  ForumTopico,
  Categoria,
  Area,
  Topico,
  Utilizador,
  UtilizadorTemPerfil,
} = require("../models/index.js");

// Criar solicitação de tópico
const criarSolicitacao = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { categoriaId, areaId, topicoId, tituloSugerido, justificativa } =
      req.body;

    // Verificar se já existe tópico para essa combinação
    const topicoExistente = await ForumTopico.findOne({
      where: {
        ID_CATEGORIA: categoriaId,
        ID_AREA: areaId,
        ID_TOPICO: topicoId,
      },
    });

    if (topicoExistente) {
      return res.status(400).json({
        success: false,
        message: "Já existe um tópico do fórum para esta categoria/área/tópico",
      });
    }

    // Verificar se já existe solicitação pendente
    const solicitacaoExistente = await ForumSolicitacao.findOne({
      where: {
        ID_CATEGORIA: categoriaId,
        ID_AREA: areaId,
        ID_TOPICO: topicoId,
        ESTADO: "Pendente",
      },
    });

    if (solicitacaoExistente) {
      return res.status(400).json({
        success: false,
        message:
          "Já existe uma solicitação pendente para esta categoria/área/tópico",
      });
    }

    const novaSolicitacao = await ForumSolicitacao.create({
      ID_SOLICITANTE: userId,
      ID_CATEGORIA: categoriaId,
      ID_AREA: areaId,
      ID_TOPICO: topicoId,
      TITULO_SUGERIDO: tituloSugerido,
      JUSTIFICATIVA: justificativa,
    });

    // Buscar solicitação completa
    const solicitacaoCompleta = await ForumSolicitacao.findByPk(
      novaSolicitacao.ID_FORUM_SOLICITACAO,
      {
        include: [
          {
            model: Utilizador,
            as: "Solicitante",
            attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
          },
          {
            model: Categoria,
            attributes: ["ID_CATEGORIA__PK___", "NOME__"],
          },
          {
            model: Area,
            attributes: ["ID_AREA", "NOME"],
          },
          {
            model: Topico,
            attributes: ["ID_TOPICO", "TITULO"],
          },
        ],
      }
    );

    res.status(201).json({
      success: true,
      message: "Solicitação enviada com sucesso",
      solicitacao: solicitacaoCompleta,
    });
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Listar solicitações (gestores veem todas, usuários veem apenas as suas)
const listarSolicitacoes = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { estado, page = 1, limit = 10 } = req.query;

    // Verificar se é gestor
    const userProfile = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
    });

    const isGestor = !!userProfile;

    const whereConditions = {};

    if (!isGestor) {
      whereConditions.ID_SOLICITANTE = userId;
    }

    if (estado) {
      whereConditions.ESTADO = estado;
    }

    const offset = (page - 1) * limit;

    const { count, rows: solicitacoes } =
      await ForumSolicitacao.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Utilizador,
            as: "Solicitante",
            attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
          },
          {
            model: Utilizador,
            as: "GestorResposta",
            attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
            required: false,
          },
          {
            model: Categoria,
            as: "Categoria",
            attributes: ["ID_CATEGORIA__PK___", "NOME__"],
          },
          {
            model: Area,
            attributes: ["ID_AREA", "NOME"],
          },
          {
            model: Topico,
            attributes: ["ID_TOPICO", "TITULO"],
          },
        ],
        order: [["DATA_CRIACAO", "DESC"]],
        limit: parseInt(limit),
        offset: offset,
      });

    res.status(200).json({
      success: true,
      solicitacoes: solicitacoes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        hasMore: offset + solicitacoes.length < count,
      },
    });
  } catch (error) {
    console.error("Erro ao listar solicitações:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Responder solicitação (apenas gestores)
const responderSolicitacao = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { solicitacaoId } = req.params;
    const { decisao, resposta, dadosTopico } = req.body; // decisao: "Aprovado" ou "Rejeitado"

    // Verificar se é gestor
    const userProfile = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
    });

    if (!userProfile) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado",
      });
    }

    const solicitacao = await ForumSolicitacao.findByPk(solicitacaoId);

    if (!solicitacao) {
      return res.status(404).json({
        success: false,
        message: "Solicitação não encontrada",
      });
    }

    if (solicitacao.ESTADO !== "Pendente") {
      return res.status(400).json({
        success: false,
        message: "Solicitação já foi respondida",
      });
    }

    // Atualizar solicitação
    await solicitacao.update({
      ESTADO: decisao,
      ID_GESTOR_RESPOSTA: userId,
      RESPOSTA_GESTOR: resposta,
      DATA_RESPOSTA: new Date(),
    });

    // Se aprovado, criar o tópico do fórum
    if (decisao === "Aprovado" && dadosTopico) {
      await ForumTopico.create({
        ID_CATEGORIA: solicitacao.ID_CATEGORIA,
        ID_AREA: solicitacao.ID_AREA,
        ID_TOPICO: solicitacao.ID_TOPICO,
        ID_CRIADOR: userId,
        TITULO: dadosTopico.titulo || solicitacao.TITULO_SUGERIDO,
        DESCRICAO:
          dadosTopico.descricao ||
          "Tópico criado a partir de solicitação de usuário",
      });
    }

    res.status(200).json({
      success: true,
      message: `Solicitação ${decisao.toLowerCase()} com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao responder solicitação:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

module.exports = {
  criarSolicitacao,
  listarSolicitacoes,
  responderSolicitacao,
};
