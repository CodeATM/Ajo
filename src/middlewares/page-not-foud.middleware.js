import { NotFoundError } from "./error.middleware";

const pageNotFound = (req, res, next) => {
  const error = new NotFoundError("Page not found");
  next(error);
};

export default pageNotFound;
