
import { NotFoundError } from "./error.middleware.js";
export const pageNotFound = (req, res, next) => {
  const error = new NotFoundError("Page not found");
  next(error);
};