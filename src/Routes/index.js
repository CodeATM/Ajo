const express = require("express");
const Router = express.Router();
const apiResponse = require("../utils/apiResponse/index");

class Routes {
  constructor() {
    let router;
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.get("/", (req, res, next) => {
      const data = {
        owner: "CyberATM",
        developer: "Oluwatimileyin Matthew",
      };

      return apiResponse.successResponse(res, 200, "CyberAtm", data);
    });

    this.router.use(`${process.env.V1_URL}`, )

    this.router.use("*", () => {
        throw New 
    })
  }
}
