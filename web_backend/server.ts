import "dotenv/config";

import express from "express";
import cors from "cors";

import authRouter from "./src/routes/auth.routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);

app.listen(8011, () => {
  console.log("Server is running on port 8011");
});
