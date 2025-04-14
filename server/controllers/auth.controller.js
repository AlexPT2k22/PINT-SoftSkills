const generateJWT = require("../utils/generateJWT");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
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
      where: { id: req.user.id },
    });
    if (!user) {
      return res.status(401).json({ error: "User não encontrado!" });
    }

    res.status(200).json({
      message: "User autenticado com sucesso!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        linkedIn: user.linkedIn,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao verificar o token!" });
  }
};

const register = async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ error: "Todos os campos devem estar preenchidos" });
  }

  try {
    const userExist = await User.findOne({
      where: { [Op.or]: [{ email: email }, { username: username }] },
    });
    if (userExist) {
      if (userExist.dataValues.email === email) {
        return res.status(400).json({ error: "Email já em uso!" });
      } else if (userExist.dataValues.username === username) {
        return res.status(400).json({ error: "Username já em uso!" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10); // hash da password
    const verificationToken = Math.floor(100000 + Math.random() * 900000); // gerar um token de verificação radom
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // expira em 24 horas
    const user = await User.create({
      username: username,
      password: hashedPassword,
      email: email,
      linkedIn: null,
      verificationToken,
      verificationExpires,
    });

    await user.save();
    const { accesstoken, refreshtoken } = generateJWT(user); // gerar o token
    res.cookie("refreshtoken", refreshtoken, {
      httpOnly: true,
      secure: process.env.PROD === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    }); // guardar o refreshtoken num cookie

    await sendVerificationEmail(user.username, user.email, verificationToken); // enviar o email de verificação

    res.status(201).json({
      message: `Registado com sucesso! Verifique o seu email para confirmar a conta!`,
      data: user,
      token: accesstoken,
    });
  } catch (error) {
    console.error("Error:", error.message || error);
    res.status(500).json({ error: "Erro ao registar" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // verificar os campos obrigatorios

  if (!email || !password) {
    return res
      .status(401)
      .json({ error: "O campo Email e password são obrigatórios!" });
  }
  // verificar se o user existe
  try {
    const user = await User.findOne({
      where: { email: email },
    });
    if (!user) {
      return res.status(401).json({ error: "Email ou password inválidos!" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password); // comparar a password
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email ou password inválidos!" });
    }

    const { accesstoken, refreshtoken } = generateJWT(user); // gerar o token
    res.cookie("refreshtoken", refreshtoken, {
      httpOnly: true,
      secure: process.env.PROD === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    }); // guardar o refreshtoken num cookie
    user.lastLogin = new Date(); // atualizar a data do ultimo login
    await user.save(); // guardar as alterações

    res.status(200).json({
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        linkedIn: user.linkedIn,
        isVerified: user.isVerified,
      },
      token: accesstoken,
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao autenticar!" });
  }
};

const linkedIN_url = (_, res) => {
  res.redirect(linkedin_url);
};

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
        verificationToken: code,
        verificationExpires: {
          [Op.gt]: new Date(), // verifica se o token ainda é válido
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Código inválido ou expirado!" });
    }

    user.isVerified = true; // marcar o user como verificado
    user.verificationToken = null; // remover o token de verificação
    user.verificationExpires = null; // remover a data de expiração do token
    await user.save();

    await sendConfirmationEmail(user.username, user.email);
    res.status(200).json({ message: "Email verificado com sucesso!" });
  } catch (error) {
    console.error(
      "Error:",
      error?.response?.data || "Erro a verificar o email"
    );
    res.status(500).json({ error: "Erro ao verificar o email!" });
  }
};

const refresh = async (req, res) => {
  const refreshtoken = req.cookies.refreshtoken;
  if (!refreshtoken) {
    return res.status(401).json({ error: "Token em falta" });
  }
  try {
    const decoded = jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User não encontrado!" });
    }

    const accesstoken = jwt.sign(
      { id: user.id, isVerified: user.isVerified },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15min",
      }
    );

    res.json({ accesstoken });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(403).json({ error: "Token inválido" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("refreshtoken", {
    httpOnly: true,
    secure: process.env.PROD === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logout realizado com sucesso!" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório!" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Email não encontrado!" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex"); // gerar um token de redefinição
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // expira em 24 horas
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    await sendResetEmail(
      user.username,
      user.email,
      `${frontendURL}/resetpassword?${resetToken}`
    );

    res.status(200).json({ message: "Email de redefinição enviado!" });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao enviar o email!" });
  }
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.query;

  if (!password) {
    return res.status(400).json({ error: "Password é obrigatória!" });
  }

  try {
    const user = await User.findOne({
      where: { resetPasswordToken: resetToken },
    });
    if (!user) {
      return res.status(404).json({ error: "Token inválido ou expirado!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // hash da password
    user.password = hashedPassword; // atualizar a password
    user.resetPasswordToken = null; // remover o token de redefinição
    user.resetPasswordExpires = null; // remover a data de expiração do token
    await user.save(); // guardar as alterações

    await sendConfirmationEmail(
      user.username,
      user.email,
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
  refresh,
};
