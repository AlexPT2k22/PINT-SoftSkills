const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateJWT(res, user) {
  const token = jwt.sign({ ID_UTILIZADOR: user.ID_UTILIZADOR }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 3600000, // 1 hour in milliseconds
  });

  return token;
}

module.exports = generateJWT;
