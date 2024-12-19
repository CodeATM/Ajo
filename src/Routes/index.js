import { Router } from "express";
import { successResponse } from "../utils/response.js";
import { NotFoundError } from "../middlewares/error.middleware.js";
import V1Routes from "../Routes/index.js";

class Routes {
  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.get("/", (req, res) => {
      const data = {
        owner: "CyberATM",
        developer: "Oluwatimileyin Matthew",
      };

      return successResponse(res, 200, "CyberAtm", data);
    });

    this.router.use(`${process.env.V1_URL}`, V1Routes);

    this.router.use("*", (req, res, next) => {
      next(new NotFoundError("API endpoint not found or in construction"));
    });
  }
}

export default new Routes().router;
