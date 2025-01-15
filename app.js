import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./src/modules/v1/routes/index.js";
import { errorMiddleware } from "./src/middlewares/error.middleware.js";
import { pageNotFound } from "./src/middlewares/middle.wares.js";
import connectDb from "./src/utils/db/index.js";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { runTransactionVerificationJob } from "./src/utils/cronJobs.js";
import { unsubscribeUserFromAplan } from "./src/services/subscriptionService/index.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Kuma-Revision"],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 600,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));
app.use(compression());
app.use(helmet());
app.get("/", (req, res) => {
  res.send("<h1>This server is healthy🎉🎊</h1>");
});
app.use(routes);

connectDb();

// runTransactionVerificationJob();
unsubscribeUserFromAplan();

app.use(pageNotFound);
app.use(errorMiddleware.handle);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
