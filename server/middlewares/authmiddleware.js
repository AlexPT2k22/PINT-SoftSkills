const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const headerToken = authHeader && authHeader.split(" ")[1];

  const cookieToken = req.cookies.token;

  const token = headerToken || cookieToken;

  if (!token) return res.status(401).json({ message: "Token em falta" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Token inválido" });
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erro ao verificar o token:", error);
    return res.status(403).json({ message: "Erro ao verificar o token" });
  }
}

module.exports = authenticateToken;
