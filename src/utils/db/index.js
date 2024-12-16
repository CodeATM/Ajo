import mongoose from "mongoose";

let URL;

if (NODE_ENV === "prod") {
  process.env.PROD_MONGODB_URL;
} else {
  process.env.MONGODB_URL;
}

const connectDb = mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`databse connected`));

export default connectDb;
