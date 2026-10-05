import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  try {
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

  } catch (error) {
    console.log(authHeader);

    return res.status(401).json({
      message: "Invalid token"
    });
  }
}