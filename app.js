const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const router = require("./src/modules/v1/routes/index.js")
const pageNotFound = require("./src/middlewares/page-not-foud.middleware.js")
const { errorHandler } = require("./src/middlewares/error.middleware.js");       
const connectDb = require("./src/utils/db/index.js")

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
app.get("/", (req, res) => {
  res.send("<h1>This server is healthy🎉🎊</h1>");
});
app.use(router);

// connectDb();

app.use(pageNotFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
