const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const generateJWTandsetCookie = (res, userID) => {
  const token = jwt.sign({ id: userID }, JWT_SECRET, {
    expiresIn: "5d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 dias
  });

  return token;
};

module.exports = generateJWTandsetCookie;
