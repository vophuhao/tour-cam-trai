import FavoriteController from "@/controllers/favorite.controller";
import { Router } from "express";

const favoriteRoutes = Router();
const favoriteController = new FavoriteController();

// All routes require authentication (applied in server/src/index.ts)

// Add to favorites
favoriteRoutes.post("/", favoriteController.addToFavorites);

// Get user's favorites (with query params: type, page, limit)
favoriteRoutes.get("/", favoriteController.getUserFavorites);

// Check if favorited
favoriteRoutes.get("/check/:refType/:refId", favoriteController.checkIsFavorited);

// Update notes
favoriteRoutes.patch("/:id/notes", favoriteController.updateNotes);

// Remove from favorites (by favorite ID)
favoriteRoutes.delete("/:id", favoriteController.removeFavorite);

// Remove by property/site ID
favoriteRoutes.delete("/property/:propertyId", favoriteController.removeFavoriteByProperty);
favoriteRoutes.delete("/site/:siteId", favoriteController.removeFavoriteBySite);

export default favoriteRoutes;
