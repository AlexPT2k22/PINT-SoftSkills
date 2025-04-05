const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const generateJWTandsetCookie = (res, userID) => {
  const token = jwt.sign({ id: userID }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 3600000, // 1 hour in milliseconds
  });

  return token;
};

module.exports = generateJWTandsetCookie;
