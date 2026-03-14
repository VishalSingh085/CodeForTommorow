import User from "../model/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const getAccessToken = (user) => {
  return jwt.sign("accessToken", process.env.ACCESS_TOKEN, { expiresIn: "1m" });
};
const getRefreshToken = (user) => {
  return jwt.sign("refreshToken", process.env.REFRESH_TOKEN, {
    expiresIn: "7m",
  });
};
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({
        message: "user credential empty",
        success: false,
      });
    }

    const user = await User.find({ email });
    if (user) {
      res.status(400).json({
        message: "Already user exist login please",
        success: false,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hashPassword });

    const accessToken = getAccessToken(user);
    const refreshToken = getRefreshToken(user);
    user.refreshToken = refreshToken;
    await User.save();

    res.cookie("accessToken", accessToken, { http: true, maxAge: "1*60*1000" });
    res.cookie("refreshToken", refreshToken, {
      http: true,
      maxAge: "7*24*60*60*1000",
    });

    res.status(201).json({
      message: `user created successfully ${user.name}`,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "something went worong", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        message: "user credential empty",
        success: false,
      });
    }
    const user = await User.find({ email });
    if (!user) {
      res.status(404).json({
        message: "user not found please register",
        success: false,
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      res.status(401).json({
        message: "incorrect password please correct password",
        success: false,
      });
    }

    const accessToken = getAccessToken(user);
    const refreshToken = getRefreshToken(user);
    user.refreshToken = refreshToken;
    await User.save();

    res.cookie("accessToken", accessToken, { http: true, maxAge: "1*60*1000" });
    res.cookie("refreshToken", refreshToken, {
      http: true,
      maxAge: "7*24*60*60*1000",
    });

    res.json({ message: "login successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "something went worong", success: false });
  }
};
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      res.status(400).json({
        message: "refreshtoken required",
        success: false,
      });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({
        message: "token expired",
        success: false,
      });
    }
    const newAccessToken = getAccessToken(user);
    res.cookie("accessToken", newAccessToken, {
      http: true,
      maxAge: "1*60*1000",
    });
    res.json({ message: "token refreshed successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "something went worong", success: false });
  }
};
