import userModel from "../models/user.model.js";
import * as UserService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";

/**
 * Controller for creating a new user.
 */
export const createUserController = async (req, res) => {
  const errors = validationResult(req); // Validate request data
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await UserService.createUser(req.body);
    const token = await user.generateJWT();

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    delete user._doc.password;

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * Controller for logging in a user.
 */
export const loginController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(404).json({ message: "Invalid Password" });
    }

    const token = await user.generateJWT();

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    delete user._doc.password;

    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * loggedIn user Profile.
 */
export const profileController = async (req, res) => {
  console.log(req.user);
  res.status(200).json({ user: req.user });
};

export const getAllUsersController = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    if (!loggedInUser) {
      return res.status(401).json({ message: "Unauthorized User" });
    }
    const allUsers = await UserService.getAllUsers({
      userId: loggedInUser._id,
    });
    res.status(200).json({ allUsers });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * logout controller
 */

export const logoutController = async (req, res) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied" });
    }

    await redisClient.set(token, "logout", "EX", 60 * 60 * 24);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
