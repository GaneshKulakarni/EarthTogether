const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    console.log("No token provided in request");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_earthtogether_app_2024';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.user.id).select("-password");
    if (!req.user) {
      console.log("User not found for token:", decoded.user.id);
      return res.status(404).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
