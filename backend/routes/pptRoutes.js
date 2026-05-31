import express from "express";
import { generatePPT } from "../controllers/pptController.js";

const router = express.Router();
router.post("/generate-ppt", generatePPT);

export default router;