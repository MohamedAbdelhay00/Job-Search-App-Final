import mongoose from "mongoose";

mongoose
  .connect("mongodb://127.0.0.1:27017/jobSearchApp")
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });