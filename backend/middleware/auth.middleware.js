import jwt from "jsonwebtoken";
import "dotenv/config.js";
import redisClient from "../services/redis.service.js";

/**
 * Middleware to authenticate the user using a JWT token.
 */
export const authUser = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied" });
    }

    const isBlackListed = await redisClient.get(token);
    if (isBlackListed) {
      res.cookie("token", "");
      return res.status(401).send({ error: "Unauthorized User" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token / Please authenticate" });
  }
};
