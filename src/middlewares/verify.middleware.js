import Jwt from "jsonwebtoken";
import { UnauthorizedError } from "./error.middleware.js";

export const verify = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for the presence of the Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Missing or invalid Authorization header")
    );
  }
  const token = authHeader.split(" ")[1];

  try {
    const user = Jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
    console.log(user.userId)
    req.user = user.userId;
    next();
  } catch (err) {
    next(err);
  }
};
