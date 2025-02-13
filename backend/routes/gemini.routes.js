import { Router } from "express";
import * as aiController from "../controllers/gemini.controller.js";
const router = Router();

router.get("/get-result", aiController.getResultController )

export default router;
