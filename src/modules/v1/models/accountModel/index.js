import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  surname: {
    type: String,
    required: true,
  },
  middlename: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
});

export default accountSchema;
