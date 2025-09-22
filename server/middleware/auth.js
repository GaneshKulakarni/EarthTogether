const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    console.log("No token provided in request");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
