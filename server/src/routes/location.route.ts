
import LocationController from "@/controllers/location.controller";
import { container, TOKENS } from "@/di";
import requireAdmin from "@/middleware/require-admin";
import LocationService from "@/services/location.service";

import { Router } from "express";

const locationRoutes = Router();

const locationService = container.resolve<LocationService>(TOKENS.LocationService);
const locationController = new LocationController(locationService);

// prefix: /locations
locationRoutes.get("/", locationController.getLocationsPaginated);
locationRoutes.post("/", requireAdmin, locationController.createLocation);
locationRoutes.get("/all", locationController.getLocations);
locationRoutes.get("/:id", locationController.getLocationById);
locationRoutes.put("/:id", requireAdmin, locationController.updateLocation);
locationRoutes.delete("/:id", requireAdmin, locationController.deleteLocation);
export default locationRoutes;