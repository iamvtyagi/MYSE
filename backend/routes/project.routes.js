import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/create",
  body("name").isString().withMessage("Name is required"),
  authUser,
  projectController.createProjectController
);

router.get("/all", authUser, projectController.getAllProjectsController);

router.put(
  "/add-user",
  authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  projectController.addUserToProjectController
);

router.get(
  "/get-project/:projectId",
  authUser,
  projectController.getProjectByIdController
);

export default router;
