const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("Auth Header:", authHeader);
  const headerToken = authHeader && authHeader.split(" ")[1];
  console.log("Header Token:", headerToken);

  const cookieToken = req.cookies.token;
  console.log("Cookie Token:", cookieToken);

  const token = headerToken || cookieToken;
  //console.log("Token:", token);

  if (!token) return res.status(401).json({ message: "Token em falta" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("Decoded Token:", decoded);
    if (!decoded) return res.status(401).json({ message: "Token inválido" });
    req.user = decoded;
    console.log("User from Token:", req.user);
    next();
  } catch (error) {
    console.error("Erro ao verificar o token:", error);
    return res.status(403).json({ message: "Erro ao verificar o token" });
  }
}

function checkRole(req, res, next) {
  authenticateToken(req, res, () => {
    const userRole = req.user.perfil;
    console.log("User Role:", userRole);
    if (userRole === 3 || userRole === 2) {
      next();
    } else {
      return res.status(403).json({ message: "Acesso negado" });
    }
  });
}

module.exports = {authenticateToken, checkRole};
