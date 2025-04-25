const generateJWT = require("../utils/generateJWT");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const UtilizadorTemPerfil = require("../models/utilizadortemperfil.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const axios = require("axios");
const { Op } = require("sequelize");
require("dotenv").config();
const linkedin_url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&scope=openid%20profile%20email`;
const {
  sendVerificationEmail,
  sendResetEmail,
  sendConfirmationEmail,
} = require("../mail/emails.js");
const backendURL =
  process.env.PROD === "production"
    ? `${process.env.BACKEND_URL}`
    : "http://localhost:4000";

const frontendURL =
  process.env.PROD === "production"
    ? `${process.env.FRONTEND_URL_PROD}`
    : "http://localhost:5173";

const checkauth = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { ID_UTILIZADOR: req.user.ID_UTILIZADOR },
    });
    if (!user) {
      return res.status(401).json({ error: "User não encontrado!" });
    }

    res.status(200).json({
      message: "User autenticado com sucesso!",
      user: {
        id: user.ID_UTILIZADOR,
        username: user.USERNAME,
        email: user.EMAIL,
        isVerified: user.ESTA_VERIFICADO,
      },
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao verificar o token!" });
  }
};

const register = async (req, res) => {
  const { USERNAME, EMAIL, PASSWORD } = req.body;
  if (!USERNAME || !PASSWORD || !EMAIL) {
    return res
      .status(400)
      .json({ error: "Todos os campos devem estar preenchidos" });
  }

  try {
    const userExist = await User.findOne({
      where: { [Op.or]: [{ EMAIL: EMAIL }, { USERNAME: USERNAME }] },
    });
    if (userExist) {
      if (userExist.dataValues.EMAIL === EMAIL) {
        return res.status(400).json({ error: "Email já em uso!" });
      } else if (userExist.dataValues.USERNAME === USERNAME) {
        return res.status(400).json({ error: "Username já em uso!" });
      }
    }

    const hashedPassword = await bcrypt.hash(PASSWORD, 10); // hash da password
    const verificationToken = Math.floor(100000 + Math.random() * 900000); // gerar um token de verificação radom
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // expira em 24 horas
    const user = await User.create({
      USERNAME: USERNAME,
      PASSWORD: hashedPassword,
      EMAIL: EMAIL,
      VERIFICATIONTOKEN: verificationToken,
      VERIFICATIONTOKENEXPIRES: verificationExpires,
    });

    await user.save();
    // associar formando a user
    await UtilizadorTemPerfil.create({
      ID_UTILIZADOR: user.ID_UTILIZADOR,
      ID_PERFIL: 1,
    });
    generateJWT(res, user); // gerar o token
    await sendVerificationEmail(user.USERNAME, user.EMAIL, verificationToken); // enviar o email de verificação

    res.status(201).json({
      message: `Registado com sucesso! Verifique o seu email para confirmar a conta!`,
      user: {
        id: user.ID_UTILIZADOR,
        username: user.USERNAME,
        email: user.EMAIL,
        isVerified: user.ESTA_VERIFICADO,
      },
    });
  } catch (error) {
    console.error("Error:", error.message || error);
    res.status(500).json({ error: "Erro ao registar" });
  }
};

const login = async (req, res) => {
  const { EMAIL, PASSWORD } = req.body;
  // verificar os campos obrigatorios

  if (!EMAIL || !PASSWORD) {
    return res
      .status(401)
      .json({ error: "O campo Email e password são obrigatórios!" });
  }
  // verificar se o user existe
  try {
    const user = await User.findOne({
      where: { EMAIL: EMAIL },
    });
    if (!user) {
      return res.status(401).json({ error: "Email ou password inválidos!" });
    }
    const isPasswordValid = await bcrypt.compare(PASSWORD, user.PASSWORD); // comparar a password
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email ou password inválidos!" });
    }

    generateJWT(res, user);
    user.ULTIMO_LOGIN = new Date();
    // ver o tipo de perfil do user
    const perfil = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: user.ID_UTILIZADOR },
      attributes: ["ID_PERFIL"], // 0 - formando, 1 - formador, 2 - admin
    });
    await user.save();

    res.status(200).json({
      message: "Login realizado com sucesso!",
      user: {
        username: user.USERNAME,
        email: user.EMAIL,
        isVerified: user.ESTA_VERIFICADO,
        perfil: perfil.ID_PERFIL,
      },
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao autenticar!" });
  }
};

const linkedIN_url = (_, res) => {
  res.redirect(linkedin_url);
};

//FIXME:
const linkedINLogin = async (req, res) => {
  const { code } = req.query;
  //console.log("Code:", code);

  if (!code) {
    return res.status(400).json({ error: "Código não encontrado!" });
  }

  try {
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          redirect_uri: process.env.REDIRECT_URL,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    //console.log("Access Token:", accessToken);

    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const userProfile = profileResponse.data;
    const LinkedinUsername = userProfile.name;
    const email = userProfile.email;
    const firstName = userProfile.given_name;
    const lastName = userProfile.family_name;
    //console.log("Username:", username);
    //console.log("Email:", email);
    console.log(userProfile);
    //console.log(`Primeiro nome: ${firstName}`);
    //console.log(`Ultimo nome: ${lastName}`);

    // verificar se o user existe
    const userExist = await User.findOne({
      where: {
        [Op.and]: [
          { username: LinkedinUsername },
          { email: email },
          { firstName: firstName },
          { lastName: lastName },
        ],
      },
    });
    if (userExist) {
      console.log(`Sucesso`);
      //console.log(userExist);
      return res.redirect(`${URL}/api/dashboard?username=${LinkedinUsername}`);
    } else {
      //return res.status(401).json({ error: "User não existe" });
      const password = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(password);
      console.log(hashedPassword);
      const user = await User.create({
        username: LinkedinUsername,
        email: email,
        linkedIn: null,
        firstName: firstName,
        lastName: lastName,
        password: hashedPassword,
      });
      await user.save();
      console.log("User criado com sucesso!");
      console.log(userProfile);
      res.redirect(`${frontendURL}/linkedin?email=${email}`); //FIXME:
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao autenticar com o LinkedIn!" });
  }
};

const linkedInAssociate = async (req, res) => {
  //FIXME:
  const { email } = req.query;
  const { url } = req.body;
  console.log(email);
  console.log(url);

  try {
    const user = await User.findOne({
      where: { [Op.and]: [{ email: email }, { linkedIn: null }] },
    });

    if (!user) {
      return res.status(500).json({
        error: `Não foi possivel encontrar o email: ${email} OU email já com LinkedIn associado`,
      });
    }

    //ver se existe a url (feito no frontend)

    await User.update({ linkedIn: url }, { where: { email: email } });
    res
      .status(200)
      .json({ message: `Adicionado LinkedIn com sucesso a ${email}` });
  } catch (error) {
    console.log(error.response.data.error || "Erro no servidor");
  }
};

const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      where: {
        VERIFICATIONTOKEN: code,
        VERIFICATIONTOKENEXPIRES: {
          [Op.gt]: new Date(), // verifica se o token ainda é válido
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Código inválido ou expirado!" });
    }

    user.ESTA_VERIFICADO = true; // marcar o user como verificado
    user.VERIFICATIONTOKEN = null; // remover o token de verificação
    user.VERIFICATIONTOKENEXPIRES = null; // remover a data de expiração do token
    await user.save();

    res.status(200).json({ message: "Email verificado com sucesso!" });
  } catch (error) {
    console.error(
      "Error:",
      error?.response?.data || "Erro a verificar o email"
    );
    res.status(500).json({ error: "Erro ao verificar o email!" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout realizado com sucesso!" });
};

const forgotPassword = async (req, res) => {
  const { EMAIL } = req.body;
  if (!EMAIL) {
    return res.status(400).json({ error: "Email é obrigatório!" });
  }

  try {
    const user = await User.findOne({ where: { EMAIL: EMAIL } });

    if (!user) {
      return res.status(404).json({ error: "Email não encontrado!" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex"); // gerar um token de redefinição
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // expira em 24 horas
    user.RESETPASSWORDTOKEN = resetToken;
    user.RESETPASSWORDEXPIRES = resetExpires;
    await user.save();

    await sendResetEmail(
      user.USERNAME,
      user.EMAIL,
      `${frontendURL}/resetpassword/${resetToken}`
    );

    res.status(200).json({ message: "Email de redefinição enviado!" });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao enviar o email!" });
  }
};

const resetPassword = async (req, res) => {
  const { PASSWORD } = req.body;
  const { token } = req.params;
  console.log(token, PASSWORD);

  if (!PASSWORD) {
    return res.status(400).json({ error: "Password é obrigatória!" });
  }

  try {
    const user = await User.findOne({
      where: { RESETPASSWORDTOKEN: token },
    });
    if (!user) {
      return res.status(404).json({ error: "Token inválido ou expirado!" });
    }

    const hashedPassword = await bcrypt.hash(PASSWORD, 10); // hash da password
    user.PASSWORD = hashedPassword; // atualizar a password
    user.RESETPASSWORDTOKEN = null; // remover o token de redefinição
    user.RESETPASSWORDEXPIRES = null; // remover a data de expiração do token
    await user.save(); // guardar as alterações

    await sendConfirmationEmail(
      user.USERNAME,
      user.EMAIL,
      `${frontendURL}/login?login=2`
    );

    res.status(200).json({
      message: "Password redefinida com sucesso!",
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao redefinir a password!" });
  }
};

module.exports = {
  register,
  login,
  linkedIN_url,
  linkedINLogin,
  verifyEmail,
  logout,
  forgotPassword,
  resetPassword,
  linkedInAssociate,
  checkauth,
};
