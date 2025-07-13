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
const { supabaseAdmin } = require("../database/supabase.js");
const crypto = require("crypto");
require("dotenv").config();

const uploadAvaliacaoToSupabase = async (file, userId, avaliacaoId) => {
  try {
    // Gerar nome único para o arquivo
    const fileExtension = file.originalname.split(".").pop();
    const uniqueFileName = `${Date.now()}-$${fileName}.${fileExtension}`;
    const filePath = `avaliacoes-submissoes/${avaliacaoId}/${userId}/${uniqueFileName}`;

    // Upload do arquivo
    const { data, error } = await supabaseAdmin.storage
      .from("course-files")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("course-files")
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
      fileName: uniqueFileName,
    };
  } catch (error) {
    console.error("Error uploading evaluation to Supabase:", error);
    throw error;
  }
};

const deleteAvaliacaoFromSupabase = async (filePath) => {
  if (!supabaseAdmin || !filePath) {
    console.warn("Supabase não disponível ou caminho inválido:", filePath);
    return;
  }

  try {
    const { error } = await supabaseAdmin.storage
      .from("course-files")
      .remove([filePath]);

    if (error) {
      console.warn("Warning deleting evaluation file from Supabase:", error);
    } else {
      console.log(`Evaluation file deleted from Supabase: ${filePath}`);
    }
  } catch (error) {
    console.warn("Warning deleting evaluation file from Supabase:", error);
  }
};

const saveEvaluationFile = async (file, userId, avaliacaoId) => {
  // Se Supabase estiver disponível, usar Supabase
  if (supabaseAdmin) {
    try {
      const result = await uploadAvaliacaoToSupabase(file, userId, avaliacaoId);
      return {
        url: result.url,
        path: result.path,
        storage: "supabase",
      };
    } catch (error) {
      console.warn(
        "Fallback para storage local devido a erro no Supabase:",
        error
      );
    }
  }

  // Fallback para storage local
  const uploadDir = path.join(__dirname, "../public/uploads/submissoes");

  // Criar diretório se não existir
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadDir, filename);

  // guardar arquivo
  fs.writeFileSync(filePath, file.buffer);

  return {
    url: `/uploads/submissoes/${filename}`,
    path: filePath,
    storage: "local",
  };
};

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

const updateAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { TITULO, DESCRICAO, CRITERIOS, DATA_LIMITE_REALIZACAO } = req.body;
    const userId = req.user.ID_UTILIZADOR;

    // Verificar se a avaliação existe
    const avaliacao = await AvaliacaoSincrona.findByPk(id);
    if (!avaliacao) {
      return res.status(404).json({ message: "Avaliação não encontrada" });
    }

    // Verificar se o usuário tem permissão para editar (formador ou gestor)
    const perfil = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId },
    });

    if (perfil.ID_PERFIL === 1) {
      return res.status(403).json({
        message: "Apenas formadores e gestores podem editar avaliações",
      });
    }

    await avaliacao.update({
      TITULO,
      DESCRICAO,
      CRITERIOS,
      DATA_LIMITE_REALIZACAO,
    });

    res.status(200).json(avaliacao);
  } catch (error) {
    console.error("Erro ao atualizar avaliação:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.ID_UTILIZADOR;

    // Verificar se a avaliação existe
    const avaliacao = await AvaliacaoSincrona.findByPk(id);
    if (!avaliacao) {
      return res.status(404).json({ message: "Avaliação não encontrada" });
    }

    // Verificar se o usuário tem permissão para deletar (formador ou gestor)
    const perfil = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId },
    });

    if (perfil.ID_PERFIL === 1) {
      return res.status(403).json({
        message: "Apenas formadores e gestores podem deletar avaliações",
      });
    }

    // Verificar se há submissões associadas
    const submissoes = await SubmissaoAvaliacao.findAll({
      where: { ID_AVALIACAO_SINCRONA: id },
    });

    if (submissoes.length > 0) {
      return res.status(400).json({
        message:
          "Não é possível deletar uma avaliação que já possui submissões",
      });
    }

    await avaliacao.destroy();
    res.status(200).json({ message: "Avaliação deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar avaliação:", error);
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
    console.error("Erro ao procurar minhas submissões:", error);
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
    console.error("Erro ao procurar submissões da avaliação:", error);
    res.status(500).json({ message: error.message });
  }
};

const submeterTrabalho = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { ID_AVALIACAO, DESCRICAO } = req.body;

    let fileData = null;

    // Verificar se há arquivo sendo enviado
    if (req.file) {
      try {
        fileData = await saveEvaluationFile(req.file, userId, ID_AVALIACAO);
      } catch (error) {
        console.error("Error uploading evaluation file:", error);
        return res.status(500).json({
          message: `Erro ao fazer upload do arquivo: ${error.message}`,
        });
      }
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
      // Se há novo arquivo e existe submissão antiga, deletar arquivo antigo
      if (fileData && submissaoExistente.URL_ARQUIVO) {
        try {
          // Tentar determinar se é arquivo do Supabase ou local
          if (submissaoExistente.URL_ARQUIVO.includes("supabase")) {
            // Extrair path do Supabase
            const url = new URL(submissaoExistente.URL_ARQUIVO);
            const pathMatch = url.pathname.match(
              /\/storage\/v1\/object\/public\/course-files\/(.+)$/
            );
            if (pathMatch) {
              await deleteAvaliacaoFromSupabase(pathMatch[1]);
            }
          } else if (submissaoExistente.URL_ARQUIVO.startsWith("/uploads/")) {
            // Arquivo local - apagar se existir
            const localPath = path.join(
              __dirname,
              "..",
              "public",
              submissaoExistente.URL_ARQUIVO
            );
            if (fs.existsSync(localPath)) {
              fs.unlinkSync(localPath);
            }
          }
        } catch (error) {
          console.warn("Warning deleting old evaluation file:", error);
        }
      }

      // Atualizar submissão existente
      submissao = await submissaoExistente.update({
        DESCRICAO,
        URL_ARQUIVO: fileData ? fileData.url : submissaoExistente.URL_ARQUIVO,
        DATA_SUBMISSAO: new Date(),
        ESTADO: "Submetido",
      });
    } else {
      // Criar nova submissão
      submissao = await SubmissaoAvaliacao.create({
        ID_UTILIZADOR: userId,
        ID_AVALIACAO_SINCRONA: ID_AVALIACAO,
        DESCRICAO,
        URL_ARQUIVO: fileData ? fileData.url : null,
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

const updateSubmissao = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.ID_UTILIZADOR;
    const { DESCRICAO } = req.body;

    // Verificar se a submissão existe e pertence ao usuário
    const submissao = await SubmissaoAvaliacao.findOne({
      where: {
        ID_SUBMISSAO: id,
        ID_UTILIZADOR: userId,
      },
    });

    if (!submissao) {
      return res.status(404).json({
        message: "Submissão não encontrada ou não pertence ao usuário",
      });
    }

    // Verificar se a submissão já foi avaliada
    if (submissao.NOTA) {
      return res.status(400).json({
        message: "Não é possível editar uma submissão que já foi avaliada",
      });
    }

    // Verificar se a avaliação ainda está aberta
    const avaliacao = await AvaliacaoSincrona.findByPk(
      submissao.ID_AVALIACAO_SINCRONA
    );
    const hoje = new Date();
    const dataLimite = new Date(avaliacao.DATA_LIMITE_REALIZACAO);

    if (hoje > dataLimite) {
      return res.status(400).json({
        message: "Não é possível editar submissão após o prazo limite",
      });
    }

    let fileData = null;

    // Verificar se há novo arquivo sendo enviado
    if (req.file) {
      try {
        fileData = await saveEvaluationFile(
          req.file,
          userId,
          submissao.ID_AVALIACAO_SINCRONA
        );

        // Deletar arquivo antigo se existir
        if (submissao.URL_ARQUIVO) {
          try {
            if (submissao.URL_ARQUIVO.includes("supabase")) {
              const url = new URL(submissao.URL_ARQUIVO);
              const pathMatch = url.pathname.match(
                /\/storage\/v1\/object\/public\/course-files\/(.+)$/
              );
              if (pathMatch) {
                await deleteAvaliacaoFromSupabase(pathMatch[1]);
              }
            } else if (submissao.URL_ARQUIVO.startsWith("/uploads/")) {
              const localPath = path.join(
                __dirname,
                "..",
                "public",
                submissao.URL_ARQUIVO
              );
              if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
              }
            }
          } catch (error) {
            console.warn("Warning deleting old submission file:", error);
          }
        }
      } catch (error) {
        console.error("Error uploading submission file:", error);
        return res.status(500).json({
          message: `Erro ao fazer upload do arquivo: ${error.message}`,
        });
      }
    }

    // Atualizar submissão
    await submissao.update({
      DESCRICAO,
      URL_ARQUIVO: fileData ? fileData.url : submissao.URL_ARQUIVO,
      DATA_SUBMISSAO: new Date(),
    });

    res.status(200).json(submissao);
  } catch (error) {
    console.error("Erro ao atualizar submissão:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteSubmissao = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.ID_UTILIZADOR;

    // Verificar se a submissão existe e pertence ao usuário
    const submissao = await SubmissaoAvaliacao.findOne({
      where: {
        ID_SUBMISSAO: id,
        ID_UTILIZADOR: userId,
      },
    });

    if (!submissao) {
      return res.status(404).json({
        message: "Submissão não encontrada ou não pertence ao usuário",
      });
    }

    // Verificar se a submissão já foi avaliada
    if (submissao.NOTA) {
      return res.status(400).json({
        message: "Não é possível apagar uma submissão que já foi avaliada",
      });
    }

    // Verificar se a avaliação ainda está aberta
    const avaliacao = await AvaliacaoSincrona.findByPk(
      submissao.ID_AVALIACAO_SINCRONA
    );
    const hoje = new Date();
    const dataLimite = new Date(avaliacao.DATA_LIMITE_REALIZACAO);

    if (hoje > dataLimite) {
      return res.status(400).json({
        message: "Não é possível apagar submissão após o prazo limite",
      });
    }

    // Deletar arquivo se existir
    if (submissao.URL_ARQUIVO) {
      try {
        if (submissao.URL_ARQUIVO.includes("supabase")) {
          const url = new URL(submissao.URL_ARQUIVO);
          const pathMatch = url.pathname.match(
            /\/storage\/v1\/object\/public\/course-files\/(.+)$/
          );
          if (pathMatch) {
            await deleteAvaliacaoFromSupabase(pathMatch[1]);
          }
        } else if (submissao.URL_ARQUIVO.startsWith("/uploads/")) {
          const localPath = path.join(
            __dirname,
            "..",
            "public",
            submissao.URL_ARQUIVO
          );
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
          }
        }
      } catch (error) {
        console.warn("Warning deleting submission file:", error);
      }
    }

    await submissao.destroy();
    res.status(200).json({ message: "Submissão apagada com sucesso" });
  } catch (error) {
    console.error("Erro ao apagar submissão:", error);
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
          required: false,
        },
      ],
      order: [["DATA_LIMITE_REALIZACAO", "ASC"]],
    });

    res.status(200).json(avaliacoes);
  } catch (error) {
    console.error("Erro ao procurar próximas avaliações:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAvaliacao,
  getAvaliacoesByCurso,
  updateAvaliacao,
  deleteAvaliacao,
  getMinhasSubmissoesByCurso,
  getSubmissoesByAvaliacao,
  submeterTrabalho,
  updateSubmissao,
  deleteSubmissao,
  avaliarSubmissao,
  getProximasAvaliacoes,
};
