import * as projectService from "../services/project.service.js";
import userModel from "../models/user.model.js";
import { validationResult } from "express-validator";

//creating project controller
export const createProjectController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = loggedInUser._id;

    //create a new project
    const newProject = await projectService.createProject({ name, userId });

    return res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// get all projects
export const getAllProjectsController = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const allUserProjects = await projectService.getAllProjectByUserId({
      userId: loggedInUser._id,
    });

    console.log("All projects for user:", allUserProjects);

    return res.status(200).json({ projects: allUserProjects });
  } catch (error) {
    console.error("Error getting all projects:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const addUserToProjectController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, users } = req.body;

    const loggedInUser = await userModel.findOne({ email: req.user.email });

    const project = await projectService.addUsersToProject({
      projectId,
      users,
      userId: loggedInUser._id,
    });
    return res
      .status(200)
      .json({ message: "Users added successfully", project });
  } catch (error) {
    console.error("Error adding user to project:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getProjectByIdController = async (req, res) => {
  const { projectId } = req.params;

  try {
    console.log("Fetching project with ID:", projectId);

    const project = await projectService.getProjectById({ projectId });

    if (!project) {
      console.log("Project not found:", projectId);
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ project });
  } catch (error) {
    console.error("Error getting project by ID:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
