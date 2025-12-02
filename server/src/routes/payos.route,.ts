import { handlePayOSWebhook } from "@/controllers/payos.controller";
import { Router } from "express";


const payosRoutes = Router();

payosRoutes.post("/", handlePayOSWebhook);


export default payosRoutes;