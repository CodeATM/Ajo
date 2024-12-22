import { Router } from "express";
import { successResponse } from "../../../utils/response.js";
import { NotFoundError } from "../../../utils/error/index.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

class Routes {
  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    // Root endpoint
    this.router.get("/", (req, res) => {
      const data = {
        owner: "CyberATM",
        developer: "Oluwatimileyin Matthew",
      };

      return successResponse(res, 200, "CyberATM", data);
    });

    // V1 Routes
    const v1Router = Router();
    this.initializeV1Routes(v1Router);
    this.router.use(`${process.env.V1_URL || "/api/v1"}`, v1Router);

    // Handle undefined routes
    this.router.use("*", (req, res, next) => {
      next(new NotFoundError("API endpoint not found or under construction"));
    });
  }

  initializeV1Routes(router) {
    // Add specific V1 routes here
    router.use("/auth", authRoutes);
    router.use("/user", userRoutes);

    // Handle 404 for undefined routes in V1
    router.use("*", (req, res, next) => {
      next(
        new NotFoundError(
          "API Endpoint does not exist or is currently under construction"
        )
      );
    });
  }
}

export default new Routes().router;
