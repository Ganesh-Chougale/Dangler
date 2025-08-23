import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function authenticate(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}
