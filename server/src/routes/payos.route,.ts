import { handlePayOSWebhook } from "@/controllers/payos.controller";
import { Router } from "express";


const router = Router();

router.post("/payos/webhook", handlePayOSWebhook);