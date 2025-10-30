import { MediaController } from "@/controllers";
import { upload } from "@/middleware";
import { Router } from "express";

const mediaRoutes = Router();

const mediaController = new MediaController();

// prefix: /media
mediaRoutes.post("/save", upload.array("files", 10), mediaController.saveMediaHandler);

export default mediaRoutes;
