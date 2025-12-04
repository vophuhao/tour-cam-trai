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
 * Migration Script: Campsite → Property + Site Architecture
 *
 * This script migrates the database from single-level Campsite model
 * to two-level Property-Site architecture.
 *
 * Steps:
 * 1. Create Property from each Campsite
 * 2. Create Site from each Campsite
 * 3. Update Bookings to reference Property + Site
 * 4. Update Reviews with split ratings
 * 5. Update Availability to reference Site
 *
 * Usage: npm run migrate:property-site
 */

// Helper functions
function mapPropertyType(campsiteType: string): string {
  const mapping: Record<string, string> = {
    tent: "private_land",
    rv: "campground",
    cabin: "ranch",
    glamping: "farm",
    treehouse: "private_land",
    yurt: "farm",
    dome: "private_land",
    "tiny-house": "ranch",
  };
  return mapping[campsiteType] || "private_land";
}

function mapAccommodationType(campsiteType: string): string {
  // Direct mapping - campsite propertyType is already accommodation type
  return campsiteType;
}

function getLodgingType(
  type: string
): "bring_your_own" | "structure_provided" | "vehicle_provided" {
  if (["tent", "rv"].includes(type)) return "bring_your_own";
  if (["cabin", "yurt", "treehouse", "glamping", "dome", "tiny-house"].includes(type))
    return "structure_provided";
  if (["airstream", "vintage-trailer", "van"].includes(type)) return "vehicle_provided";
  return "bring_your_own";
}

function extractSharedAmenities(_amenities: any[]): any {
  // For initial migration, set default shared amenities
  // In real scenario, you'd query Amenity model and categorize
  return {
    toilets: {
      available: true,
      type: "flush",
      count: 2,
      isADA: false,
    },
    showers: {
      available: true,
      type: "hot",
      count: 1,
    },
    parking: {
      available: true,
      type: "gravel",
      spaces: 5,
    },
    wifi: {
      available: false,
    },
    electricity: {
      available: true,
      voltage: 220,
    },
    waterAccess: {
      available: true,
      type: "potable",
      isDrinkable: true,
    },
    trash: {
      available: true,
      type: "bins",
    },
  };
}

function extractSiteAmenities(): any {
  return {
    electrical: {
      available: true,
      amperage: 30,
      outlets: 2,
    },
    water: {
      hookup: false,
      nearby: true,
      distance: 50,
    },
    sewer: {
      hookup: false,
      dumpStation: true,
      distance: 100,
    },
    firePit: true,
    fireRing: true,
    firewood: "available_for_purchase",
    furniture: ["picnic_table"],
    wifi: false,
    tv: false,
    accessible: false,
    wheelchairAccessible: false,
  };
}

function extractRules(campsite: any): any[] {
  const rules = [];

  if (campsite.rules) {
    if (campsite.rules.checkIn && campsite.rules.checkOut) {
      rules.push({
        text: `Check-in: ${campsite.rules.checkIn}, Check-out: ${campsite.rules.checkOut}`,
        category: "general",
        order: 1,
      });
    }

    if (campsite.rules.allowPets !== undefined) {
      rules.push({
        text: campsite.rules.allowPets ? "Pets allowed" : "No pets allowed",
        category: "pets",
        order: 2,
      });
    }

    if (campsite.rules.quietHours) {
      rules.push({
        text: campsite.rules.quietHours,
        category: "noise",
        order: 3,
      });
    }

    if (campsite.rules.fireRestrictions) {
      rules.push({
        text: campsite.rules.fireRestrictions,
        category: "fire",
        order: 4,
      });
    }
  }

  return rules;
}

async function migrate() {
  try {
    console.log("🚀 Starting Property-Site migration...\n");

    await connectToDatabase();

    // Get all campsites
    const campsites = await CampsiteModel.find().lean();
    console.log(`📊 Found ${campsites.length} campsites to migrate\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const campsite of campsites) {
      try {
        console.log(`\n📍 Migrating: ${campsite.name}`);

        // Step 1: Create Property
        const property = await PropertyModel.create({
          host: campsite.host,
          name: campsite.name,
          slug: campsite.slug,
          tagline: campsite.tagline,
          description: campsite.description,

          // Location
          location: {
            address: campsite.location.address,
            city: campsite.location.city,
            state: campsite.location.state,
            country: campsite.location.country,
            zipCode: campsite.location.zipCode,
            coordinates: campsite.location.coordinates,
            directions: campsite.location.directions,
          },

          // Property details
          propertyType: mapPropertyType(campsite.propertyType),
          terrain: campsite.terrain || "forest",

          // Photos
          photos:
            campsite.images?.map((url: string, index: number) => ({
              url,
              isCover: index === 0,
              order: index,
            })) || [],

          // Shared amenities
          sharedAmenities: extractSharedAmenities(campsite.amenities),

          // Activities
          activities: campsite.activities || [],

          // Rules
          rules: extractRules(campsite),
          checkInInstructions: campsite.rules?.checkInInstructions,
          checkOutInstructions: campsite.rules?.checkOutInstructions,

          // Policies
          cancellationPolicy: {
            type: "moderate",
            refundRules: [
              { daysBeforeCheckIn: 7, refundPercentage: 100 },
              { daysBeforeCheckIn: 3, refundPercentage: 50 },
              { daysBeforeCheckIn: 0, refundPercentage: 0 },
            ],
          },

          petPolicy: {
            allowed: campsite.rules?.allowPets || false,
            maxPets: campsite.capacity?.maxPets || 0,
            fee: campsite.pricing?.petFee || 0,
          },

          childrenPolicy: {
            allowed: campsite.rules?.allowChildren !== false,
          },

          // Stats
          stats: {
            totalSites: 1,
            activeSites: campsite.isActive ? 1 : 0,
            totalBookings: 0,
            totalReviews: campsite.rating?.count || 0,
            averageRating: campsite.rating?.average || 0,
            ratings: {
              location: 0,
              communication: 0,
              value: 0,
            },
            viewCount: campsite.viewsCount || 0,
          },

          // Rating (for compatibility)
          rating: campsite.rating
            ? {
                average: campsite.rating.average || 0,
                count: campsite.rating.count || 0,
                breakdown: {
                  location: campsite.rating.breakdown?.location || 0,
                  communication: campsite.rating.breakdown?.communication || 0,
                  value: campsite.rating.breakdown?.value || 0,
                },
              }
            : undefined,

          // Status
          status: campsite.isActive ? "active" : "inactive",
          isActive: campsite.isActive,
          isFeatured: campsite.isFeatured || false,
          isVerified: false,

          // Settings
          settings: {
            instantBookEnabled: campsite.isInstantBook || false,
            requireApproval: !campsite.isInstantBook,
            minimumAdvanceNotice: 24,
            bookingWindow: 365,
            allowWholePropertyBooking: true,
          },
        });

        console.log(`  ✅ Created property: ${property.name}`);

        // Step 2: Create Site
        const site = await SiteModel.create({
          property: property._id,
          name: campsite.name,
          slug: `${campsite.slug}-main`,
          description: campsite.description,

          siteType: "designated",
          accommodationType: mapAccommodationType(campsite.propertyType),
          lodgingProvided: getLodgingType(campsite.propertyType),

          // Site location (same as property for single-site migration)
          siteLocation: {
            coordinates: campsite.location.coordinates,
            relativeDescription: "Main camping area",
          },

          // Capacity
          capacity: {
            maxGuests: campsite.capacity?.maxGuests || 4,
            maxAdults: campsite.capacity?.maxAdults,
            maxChildren: campsite.capacity?.maxChildren,
            maxPets: campsite.capacity?.maxPets || 0,
            maxVehicles: campsite.capacity?.maxVehicles || 1,
            maxTents: campsite.capacity?.maxTents,
            maxRVs: campsite.capacity?.maxRVs,
            rvMaxLength: campsite.capacity?.rvMaxLength,
          },

          // Pricing
          pricing: {
            basePrice: campsite.pricing?.basePrice || 0,
            weekendPrice: campsite.pricing?.weekendPrice,
            weeklyDiscount: campsite.pricing?.weeklyDiscount,
            monthlyDiscount: campsite.pricing?.monthlyDiscount,
            petFee: campsite.pricing?.petFee,
            cleaningFee: campsite.pricing?.cleaningFee,
            depositAmount: campsite.pricing?.depositAmount,
            currency: campsite.pricing?.currency || "VND",
          },

          // Booking settings
          bookingSettings: {
            minimumNights: campsite.rules?.minNights || 1,
            maximumNights: campsite.rules?.maxNights,
            checkInTime: campsite.rules?.checkIn || "14:00",
            checkOutTime: campsite.rules?.checkOut || "11:00",
            instantBook: campsite.isInstantBook || false,
            advanceNotice: 24,
            allowSameDayBooking: false,
          },

          // Photos (same as property for now)
          photos:
            campsite.images?.map((url: string, index: number) => ({
              url,
              isCover: index === 0,
              order: index,
            })) || [],

          // Site amenities
          amenities: extractSiteAmenities(),

          // Stats
          stats: {
            totalBookings: 0,
            totalReviews: campsite.rating?.count || 0,
            averageRating: campsite.rating?.average || 0,
            ratings: {
              cleanliness: 0,
              accuracy: 0,
            },
            viewCount: campsite.viewsCount || 0,
          },

          // Rating (for compatibility)
          rating: campsite.rating
            ? {
                average: campsite.rating.average || 0,
                count: campsite.rating.count || 0,
                breakdown: {
                  cleanliness: campsite.rating.breakdown?.cleanliness || 0,
                  accuracy: campsite.rating.breakdown?.accuracy || 0,
                  amenities: 0,
                },
              }
            : undefined,

          // Status
          status: campsite.isActive ? "active" : "inactive",
          isActive: campsite.isActive,
          isAvailableForBooking: campsite.isActive,
        });

        console.log(`  ✅ Created site: ${site.name}`);

        // Step 3: Update Bookings
        const bookingUpdateResult = await BookingModel.updateMany(
          { campsite: campsite._id },
          {
            $set: {
              property: property._id,
              site: site._id,
            },
            $unset: { campsite: "" },
          }
        );
        console.log(`  ✅ Updated ${bookingUpdateResult.modifiedCount} bookings`);

        // Step 4: Update Reviews with split ratings
        const reviews = await ReviewModel.find({ campsite: campsite._id });
        for (const review of reviews) {
          const ratings = review.ratings || {};
          const overall = ratings.overall || 0;
          const cleanliness = ratings.cleanliness || 0;
          const accuracy = ratings.accuracy || 0;
          const location = ratings.location || 0;
          const value = ratings.value || 0;
          const communication = ratings.communication || 0;

          // Calculate amenities rating (average of cleanliness and accuracy for now)
          const amenities = (cleanliness + accuracy) / 2;

          await ReviewModel.updateOne(
            { _id: review._id },
            {
              $set: {
                property: property._id,
                site: site._id,
                propertyRatings: {
                  location,
                  communication,
                  value,
                },
                siteRatings: {
                  cleanliness,
                  accuracy,
                  amenities,
                },
                overallRating: overall,
              },
              $unset: { campsite: "", ratings: "" },
            }
          );
        }
        console.log(`  ✅ Updated ${reviews.length} reviews with split ratings`);

        // Step 5: Update Availability
        const availabilityUpdateResult = await AvailabilityModel.updateMany(
          { campsite: campsite._id },
          {
            $set: { site: site._id },
            $unset: { campsite: "" },
          }
        );
        console.log(`  ✅ Updated ${availabilityUpdateResult.modifiedCount} availability records`);

        successCount++;
        console.log(`  ✨ Successfully migrated: ${campsite.name}`);
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error migrating ${campsite.name}:`, error);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary");
    console.log("=".repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📝 Total: ${campsites.length}`);
    console.log("=".repeat(60) + "\n");

    if (errorCount === 0) {
      console.log("🎉 Migration completed successfully!");
    } else {
      console.log("⚠️  Migration completed with errors. Please review the logs.");
    }
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
  }
}

// Run migration
migrate();
