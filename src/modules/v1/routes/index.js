const express = require("express");

function V1Routes() {
  const router = express.Router();

  router.use("/auth", authRoutes);
  // To catch 404 Errors
  router.use("*", () => {
    throw new NotFoundError(
      "API Endpoint does not exist or is currently under construction"
    );
  });

  return router;
}


export default V1Routes();
