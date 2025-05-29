const {
  AvaliacaoSincrona,
  CursoSincrono,
  Utilizador,
  UtilizadorTemPerfil,
  SubmissaoAvaliacao,
  InscricaoSincrono,
  Curso,
} = require("../models/index.js");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

const createAvaliacao = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { ID_CURSO, TITULO, DESCRICAO, CRITERIOS, DATA_LIMITE_REALIZACAO } =
      req.body;

    const user = await Utilizador.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const perfil = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId },
    });

    if (perfil == 1) {
      return res.status(403).json({
        message: "Apenas formadores e gestores podem criar avaliações",
      });
    }

    const avaliacao = await AvaliacaoSincrona.create({
      ID_CURSO,
      TITULO,
      DESCRICAO,
      CRITERIOS,
      DATA_LIMITE_REALIZACAO,
      DATA_CRIACAO: new Date(),
      ESTADO: "Pendente",
    });

    res.status(201).json(avaliacao);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvaliacoesByCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const avaliacoes = await AvaliacaoSincrona.findAll({
      where: { ID_CURSO: cursoId },
      include: [
        {
          model: CursoSincrono,
          attributes: ["ESTADO", "DATA_INICIO", "DATA_FIM"],
        },
      ],
    });

    res.status(200).json(avaliacoes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//TODO: implementar dps
const updateAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { NOTA, OBSERVACAO, ESTADO } = req.body;

    const avaliacao = await AvaliacaoSincrona.findByPk(id);
    if (!avaliacao) {
      return res.status(404).json({ message: "Avaliação não encontrada" });
    }

    await avaliacao.update({
      NOTA,
      OBSERVACAO,
      ESTADO,
    });

    res.status(200).json(avaliacao);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMinhasSubmissoesByCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const userId = req.user.ID_UTILIZADOR;

    const submissoes = await SubmissaoAvaliacao.findAll({
      include: [
        {
          model: AvaliacaoSincrona,
          where: { ID_CURSO: cursoId },
          attributes: ["ID_AVALIACAO_SINCRONA"],
        },
      ],
      where: { ID_UTILIZADOR: userId },
    });

    res.status(200).json(submissoes);
  } catch (error) {
    console.error("Erro ao buscar minhas submissões:", error);
    res.status(500).json({ message: error.message });
  }
};

const getSubmissoesByAvaliacao = async (req, res) => {
  try {
    const { avaliacaoId } = req.params;

    const submissoes = await SubmissaoAvaliacao.findAll({
      where: { ID_AVALIACAO_SINCRONA: avaliacaoId },
      include: [
        {
          model: Utilizador,
          attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
        },
      ],
    });

    res.status(200).json(submissoes);
  } catch (error) {
    console.error("Erro ao buscar submissões da avaliação:", error);
    res.status(500).json({ message: error.message });
  }
};

const submeterTrabalho = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { ID_AVALIACAO, DESCRICAO } = req.body;

    let URL_ARQUIVO = null;

    // Verificar se há arquivo sendo enviado
    if (req.file) {
      const uploadDir = path.join(__dirname, "../public/uploads/submissoes");

      // Criar diretório se não existir
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadDir, filename);

      // Salvar arquivo
      fs.writeFileSync(filePath, req.file.buffer);
      URL_ARQUIVO = `/uploads/submissoes/${filename}`;
    }

    // Verificar se já existe uma submissão para este usuário e avaliação
    const submissaoExistente = await SubmissaoAvaliacao.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_AVALIACAO_SINCRONA: ID_AVALIACAO,
      },
    });

    let submissao;

    if (submissaoExistente) {
      // Atualizar submissão existente
      submissao = await submissaoExistente.update({
        DESCRICAO,
        URL_ARQUIVO: URL_ARQUIVO || submissaoExistente.URL_ARQUIVO,
        DATA_SUBMISSAO: new Date(),
      });
    } else {
      // Criar nova submissão
      submissao = await SubmissaoAvaliacao.create({
        ID_UTILIZADOR: userId,
        ID_AVALIACAO_SINCRONA: ID_AVALIACAO,
        DESCRICAO,
        URL_ARQUIVO,
        DATA_SUBMISSAO: new Date(),
        ESTADO: "Submetido",
      });
    }

    res.status(201).json(submissao);
  } catch (error) {
    console.error("Erro ao submeter trabalho:", error);
    res.status(500).json({ message: error.message });
  }
};

const avaliarSubmissao = async (req, res) => {
  try {
    const { ID_SUBMISSAO, NOTA, OBSERVACAO } = req.body;

    const submissao = await SubmissaoAvaliacao.findByPk(ID_SUBMISSAO);

    if (!submissao) {
      return res.status(404).json({ message: "Submissão não encontrada" });
    }

    await submissao.update({
      NOTA,
      OBSERVACAO,
      ESTADO: "Avaliado",
      DATA_AVALIACAO: new Date(),
    });

    res.status(200).json(submissao);
  } catch (error) {
    console.error("Erro ao avaliar submissão:", error);
    res.status(500).json({ message: error.message });
  }
};

const getProximasAvaliacoes = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;

    const inscricoes = await InscricaoSincrono.findAll({
      where: { ID_UTILIZADOR: userId },
      attributes: ["ID_CURSO_SINCRONO"],
    });

    const cursoIds = inscricoes.map((insc) => insc.ID_CURSO_SINCRONO);

    const avaliacoes = await AvaliacaoSincrona.findAll({
      where: {
        ID_CURSO: { [Op.in]: cursoIds },
        DATA_LIMITE_REALIZACAO: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: CursoSincrono,
          include: [{ model: Curso, attributes: ["NOME"] }],
        },
        {
          model: SubmissaoAvaliacao,
          where: { ID_UTILIZADOR: userId },
          required: false, // LEFT JOIN
        },
      ],
      order: [["DATA_LIMITE_REALIZACAO", "ASC"]],
    });

    res.status(200).json(avaliacoes);
  } catch (error) {
    console.error("Erro ao buscar próximas avaliações:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAvaliacao,
  getAvaliacoesByCurso,
  updateAvaliacao,
  getMinhasSubmissoesByCurso,
  getSubmissoesByAvaliacao,
  submeterTrabalho,
  avaliarSubmissao,
  getProximasAvaliacoes,
};
