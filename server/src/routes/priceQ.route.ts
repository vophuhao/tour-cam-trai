import { Router } from "express";
import PriceQController from "@/controllers/priceQ.controller";
import { container, TOKENS } from "@/di";
import { requireAdmin } from "@/middleware";
import type PriceQService from "@/services/priceQ.service";


const priceQRoutes = Router();

const priceQService = container.resolve<PriceQService>(TOKENS.PriceQService);
const priceQController = new PriceQController(priceQService);

priceQRoutes.post("/",requireAdmin, priceQController.createPriceQ);
priceQRoutes.get("/",requireAdmin, priceQController.getAllPriceQs);


export default priceQRoutes;