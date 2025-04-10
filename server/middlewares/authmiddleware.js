const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token em falta" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Token inválido" });
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erro ao verificar o token:", error);
    return res.status(403).json({ message: "Token inválido" });
  }
}

module.exports = authenticateToken;
