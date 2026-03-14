import express from "express";
import { login, refreshToken, register } from "../controller/userController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
export default router;
