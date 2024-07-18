import jwt from "jsonwebtoken";
import User from "../../../DataBase/models/user.model.js";

// Authenticate a token steps:
// 1. Get the token from the request headers
// 2. Verify the token
// 3. Attach the user object to the request object
// 4. Call the next middleware

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = await User.findById(user.id).select("-password");
    next();
  });
};

// Verify a token steps:
// 1. Get the token from the request headers
// 2. Check if the token exists
// 3. Verify the token
// 4. Attach the user object to the request object
// 5. Call the next middleware

export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Authorize a role steps:
// 1. Find the user by id
// 2. Check if the user exists and has the role
// 3. Call the next middleware

export const authorizeRole = (roles) => (req, res, next) => {
  User.findById(req.user.id)
    .then((user) => {
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    })
    .catch((error) => {
      return res.status(500).json({ message: "Internal server error" });
    });
};
