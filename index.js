import dns from "dns";
dns.getServers("8.8.8.8", "8.8.4.4");
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import router from "./routes/userRoutes";

const app = express();

app.use(express.json());
app.use(express.cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log(err));

app.use("/user/auth", router);
const port = process.env.PORT || 3000;
app.use(port, () => {
  console.log(`server is running on ${port}`);
});
