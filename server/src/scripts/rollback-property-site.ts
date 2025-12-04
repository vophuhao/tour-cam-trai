import mongoose from "mongoose";
import "dotenv/config";
import connectToDatabase from "@/config/database";
import { CampsiteModel } from "@/models/campsite.model";
import { PropertyModel } from "@/models/property.model";
import { SiteModel } from "@/models/site.model";
import { BookingModel } from "@/models/booking.model";
import { ReviewModel } from "@/models/review.model";
import { AvailabilityModel } from "@/models/availability.model";

/**
 * Rollback Script for Property-Site Migration
 *
 * Reverts the Property-Site migration back to the original Campsite structure.
 * This should ONLY be run if the migration has critical issues.
 *
 * Process:
 * 1. Restore Campsites from Properties (Property data → Campsite)
 * 2. Update Bookings to reference campsite instead of property+site
 * 3. Update Reviews to use old ratings structure instead of split ratings
 * 4. Update Availability to reference campsite instead of site
 * 5. Delete Properties and Sites
 *
 * ⚠️  WARNING: This is a destructive operation. Backup your database first!
 *
 * Usage: npm run migrate:rollback
 */

async function rollback(): Promise<void> {
  let successCount = 0;
  let errorCount = 0;

  try {
    console.log("🔄 Starting Property-Site migration rollback...\n");

    await connectToDatabase();

    console.log("⚠️  WARNING: This will revert all Property-Site changes!");
    console.log("⚠️  Make sure you have a database backup before proceeding.\n");

    // Get all properties
    const properties = await PropertyModel.find().lean();
    console.log(`📦 Found ${properties.length} properties to rollback\n`);

    if (properties.length === 0) {
      console.log("✅ No properties found. Nothing to rollback.");
      return;
    }

    // Process each property
    for (const property of properties) {
      try {
        console.log(`\n🔄 Processing property: ${property.name}`);

        // Get the corresponding site (should be only one per property in migration)
        const site = await SiteModel.findOne({ property: property._id }).lean();

        if (!site) {
          console.log(`⚠️  No site found for property ${property.name}, skipping...`);
          errorCount++;
          continue;
        }

        // Restore campsite from property + site data
        const campsiteData = {
          name: property.name,
          description: property.description,
          host: property.host,
          location: property.location,
          address: property.address,

          // Restore type from site
          type: site.accommodationType,

          // Restore capacity from site
          capacity: {
            maxGuests: site.capacity.maxGuests,
            maxPets: site.capacity.maxPets,
            maxVehicles: site.capacity.maxVehicles,
          },

          // Restore pricing from site
          pricing: {
            basePrice: site.pricing.basePrice,
            currency: site.pricing.currency,
            fees: site.pricing.fees,
            weekendPrice: site.pricing.weekendPrice,
            seasonalPricing: site.pricing.seasonalPricing || [],
          },

          // Merge amenities from property and site
          amenities: [
            ...(property.sharedAmenities?.toilets?.available ? ["toilets"] : []),
            ...(property.sharedAmenities?.showers?.available ? ["showers"] : []),
            ...(property.sharedAmenities?.parking?.available ? ["parking"] : []),
            ...(property.sharedAmenities?.wifi?.available ? ["wifi"] : []),
            ...(property.sharedAmenities?.electricity?.available ? ["electricity"] : []),
            ...(property.sharedAmenities?.water?.available ? ["water"] : []),
            ...(site.amenities?.electrical?.available ? ["electrical-hookup"] : []),
            ...(site.amenities?.water?.available ? ["water-hookup"] : []),
            ...(site.amenities?.sewer?.available ? ["sewer-hookup"] : []),
            ...(site.amenities?.firePit ? ["fire-pit"] : []),
            ...(site.amenities?.picnicTable ? ["picnic-table"] : []),
          ],

          // Restore activities from property
          activities: property.activities || [],

          // Merge rules from property
          rules: {
            checkIn: property.policies?.checkInTime || "14:00",
            checkOut: property.policies?.checkOutTime || "11:00",
            petsAllowed:
              property.rules?.some(
                (r: any) => r.category === "pets" && r.description.toLowerCase().includes("allowed")
              ) || false,
            smokingAllowed: false,
            quietHours:
              property.rules?.find((r: any) => r.category === "noise")?.description ||
              "22:00 - 07:00",
            minAge: 18,
            customRules:
              property.rules
                ?.filter((r: any) => r.category === "general")
                .map((r: any) => r.description) || [],
          },

          // Restore images
          images: [...(property.images || []), ...(site.images || [])],

          // Restore booking settings from site
          bookingSettings: site.bookingSettings,

          // Restore policies from property
          policies: {
            cancellation: property.policies?.cancellationPolicy || "flexible",
            ...property.policies,
          },

          // Restore stats (merge from property and site)
          stats: {
            views: (property.stats?.views || 0) + (site.stats?.views || 0),
            bookings: (property.stats?.bookings || 0) + (site.stats?.bookings || 0),
            favorites: (property.stats?.saves || 0) + (site.stats?.favorites || 0),
          },

          // Restore rating (use property rating as primary)
          rating: property.rating || {
            average: 0,
            count: 0,
          },

          // Restore status
          isActive: property.isActive && site.isActive,
        };

        // Create or update campsite
        const campsite = await CampsiteModel.findOneAndUpdate(
          { _id: property._id }, // Use same ID to maintain references
          campsiteData,
          { upsert: true, new: true }
        );

        console.log(`✅ Restored campsite: ${campsite.name}`);

        // Update bookings: property + site → campsite
        const bookingUpdateResult = await BookingModel.updateMany(
          { property: property._id, site: site._id },
          {
            $set: { campsite: campsite._id },
            $unset: { property: "", site: "" },
          }
        );
        console.log(`   📅 Updated ${bookingUpdateResult.modifiedCount} bookings`);

        // Update reviews: propertyRatings + siteRatings → ratings
        const reviews = await ReviewModel.find({
          property: property._id,
          site: site._id,
        });

        for (const review of reviews) {
          // Merge split ratings back to old structure
          const propertyRatings = (review as any).propertyRatings || {};
          const siteRatings = (review as any).siteRatings || {};

          const oldRatings = {
            cleanliness: siteRatings.cleanliness || 5,
            accuracy: siteRatings.accuracy || 5,
            communication: propertyRatings.communication || 5,
            location: propertyRatings.location || 5,
            value: propertyRatings.value || 5,
            amenities: siteRatings.amenities || 5,
          };

          await ReviewModel.updateOne(
            { _id: review._id },
            {
              $set: {
                campsite: campsite._id,
                ratings: oldRatings,
              },
              $unset: {
                property: "",
                site: "",
                propertyRatings: "",
                siteRatings: "",
              },
            }
          );
        }
        console.log(`   ⭐ Updated ${reviews.length} reviews`);

        // Update availability: site → campsite
        const availabilityUpdateResult = await AvailabilityModel.updateMany(
          { site: site._id },
          {
            $set: { campsite: campsite._id },
            $unset: { site: "" },
          }
        );
        console.log(`   📆 Updated ${availabilityUpdateResult.modifiedCount} availability records`);

        successCount++;
      } catch (error) {
        console.error(`❌ Error processing property ${property.name}:`, error);
        errorCount++;
      }
    }

    // Delete all properties and sites
    console.log("\n🗑️  Cleaning up Properties and Sites...");
    const deletedProperties = await PropertyModel.deleteMany({});
    const deletedSites = await SiteModel.deleteMany({});

    console.log(`   Deleted ${deletedProperties.deletedCount} properties`);
    console.log(`   Deleted ${deletedSites.deletedCount} sites`);

    // Print summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 ROLLBACK SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Successfully rolled back: ${successCount} properties`);
    console.log(`❌ Failed to rollback: ${errorCount} properties`);
    console.log(`🗑️  Deleted ${deletedProperties.deletedCount} properties`);
    console.log(`🗑️  Deleted ${deletedSites.deletedCount} sites`);
    console.log("=".repeat(50) + "\n");

    if (errorCount > 0) {
      console.log("⚠️  Some properties failed to rollback. Please review the errors above.");
    } else {
      console.log("🎉 Rollback completed successfully!");
    }
  } catch (error) {
    console.error("💥 Rollback failed with error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
  }
}

// Run rollback
rollback();
