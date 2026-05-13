import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token not provided"
      });
    }

    const [, token] = authHeader.split(" ");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.userId;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
}