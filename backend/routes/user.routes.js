import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { body } from "express-validator";
import { authUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be provided"),
  userController.createUserController
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Email must be a valid email"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be provided"),
  userController.loginController
);

router.get("/profile", authUser, userController.profileController);

router.post("/logout", authUser, userController.logoutController);

router.get("/all", authUser, userController.getAllUsersController);

export default router;
