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
 * Migration Validation Script
 *
 * Validates that the migration from Campsite to Property-Site was successful.
 *
 * Checks:
 * 1. Count parity (Campsite count = Property count = Site count)
 * 2. No orphaned bookings (all have property + site)
 * 3. No orphaned reviews (all have property + site + split ratings)
 * 4. No orphaned availability (all reference site instead of campsite)
 * 5. Data integrity (all references are valid)
 *
 * Usage: npm run validate:migration
 */

interface ValidationResult {
  category: string;
  passed: boolean;
  message: string;
  details?: any;
}

async function validate(): Promise<void> {
  const results: ValidationResult[] = [];

  try {
    console.log("🔍 Starting migration validation...\n");

    await connectToDatabase();

    // Check 1: Count Parity
    console.log("1️⃣  Checking count parity...");
    const campsiteCount = await CampsiteModel.countDocuments();
    const propertyCount = await PropertyModel.countDocuments();
    const siteCount = await SiteModel.countDocuments();

    const countParity = campsiteCount === propertyCount && campsiteCount === siteCount;
    results.push({
      category: "Count Parity",
      passed: countParity,
      message: countParity ? "✅ All counts match" : "❌ Count mismatch detected",
      details: {
        campsites: campsiteCount,
        properties: propertyCount,
        sites: siteCount,
      },
    });

    // Check 2: Orphaned Bookings
    console.log("2️⃣  Checking for orphaned bookings...");
    const orphanedBookingsWithCampsite = await BookingModel.countDocuments({
      campsite: { $exists: true },
    });
    const bookingsWithoutProperty = await BookingModel.countDocuments({
      property: { $exists: false },
    });
    const bookingsWithoutSite = await BookingModel.countDocuments({
      site: { $exists: false },
    });

    const noOrphanedBookings =
      orphanedBookingsWithCampsite === 0 &&
      bookingsWithoutProperty === 0 &&
      bookingsWithoutSite === 0;

    results.push({
      category: "Booking Migration",
      passed: noOrphanedBookings,
      message: noOrphanedBookings
        ? "✅ All bookings migrated correctly"
        : "❌ Found orphaned bookings",
      details: {
        stillReferencingCampsite: orphanedBookingsWithCampsite,
        missingProperty: bookingsWithoutProperty,
        missingSite: bookingsWithoutSite,
      },
    });

    // Check 3: Orphaned Reviews
    console.log("3️⃣  Checking for orphaned reviews...");
    const orphanedReviewsWithCampsite = await ReviewModel.countDocuments({
      campsite: { $exists: true },
    });
    const reviewsWithoutProperty = await ReviewModel.countDocuments({
      property: { $exists: false },
    });
    const reviewsWithoutSite = await ReviewModel.countDocuments({
      site: { $exists: false },
    });
    const reviewsWithoutPropertyRatings = await ReviewModel.countDocuments({
      propertyRatings: { $exists: false },
    });
    const reviewsWithoutSiteRatings = await ReviewModel.countDocuments({
      siteRatings: { $exists: false },
    });
    const reviewsWithOldRatings = await ReviewModel.countDocuments({
      ratings: { $exists: true },
    });

    const noOrphanedReviews =
      orphanedReviewsWithCampsite === 0 &&
      reviewsWithoutProperty === 0 &&
      reviewsWithoutSite === 0 &&
      reviewsWithoutPropertyRatings === 0 &&
      reviewsWithoutSiteRatings === 0 &&
      reviewsWithOldRatings === 0;

    results.push({
      category: "Review Migration",
      passed: noOrphanedReviews,
      message: noOrphanedReviews
        ? "✅ All reviews migrated correctly"
        : "❌ Found orphaned or incomplete reviews",
      details: {
        stillReferencingCampsite: orphanedReviewsWithCampsite,
        missingProperty: reviewsWithoutProperty,
        missingSite: reviewsWithoutSite,
        missingPropertyRatings: reviewsWithoutPropertyRatings,
        missingSiteRatings: reviewsWithoutSiteRatings,
        stillHavingOldRatings: reviewsWithOldRatings,
      },
    });

    // Check 4: Orphaned Availability
    console.log("4️⃣  Checking for orphaned availability records...");
    const orphanedAvailabilityWithCampsite = await AvailabilityModel.countDocuments({
      campsite: { $exists: true },
    });
    const availabilityWithoutSite = await AvailabilityModel.countDocuments({
      site: { $exists: false },
    });

    const noOrphanedAvailability =
      orphanedAvailabilityWithCampsite === 0 && availabilityWithoutSite === 0;

    results.push({
      category: "Availability Migration",
      passed: noOrphanedAvailability,
      message: noOrphanedAvailability
        ? "✅ All availability records migrated correctly"
        : "❌ Found orphaned availability records",
      details: {
        stillReferencingCampsite: orphanedAvailabilityWithCampsite,
        missingSite: availabilityWithoutSite,
      },
    });

    // Check 5: Data Integrity - Valid References
    console.log("5️⃣  Checking data integrity...");

    // Check property-site relationships
    const sitesWithInvalidProperty = await SiteModel.aggregate([
      {
        $lookup: {
          from: "properties",
          localField: "property",
          foreignField: "_id",
          as: "propertyDoc",
        },
      },
      {
        $match: {
          propertyDoc: { $size: 0 },
        },
      },
      {
        $count: "count",
      },
    ]);

    const invalidPropertyRefs = sitesWithInvalidProperty[0]?.count || 0;

    // Check booking references
    const bookingsWithInvalidRefs = await BookingModel.aggregate([
      {
        $lookup: {
          from: "properties",
          localField: "property",
          foreignField: "_id",
          as: "propertyDoc",
        },
      },
      {
        $lookup: {
          from: "sites",
          localField: "site",
          foreignField: "_id",
          as: "siteDoc",
        },
      },
      {
        $match: {
          $or: [{ propertyDoc: { $size: 0 } }, { siteDoc: { $size: 0 } }],
        },
      },
      {
        $count: "count",
      },
    ]);

    const invalidBookingRefs = bookingsWithInvalidRefs[0]?.count || 0;

    const dataIntegrity = invalidPropertyRefs === 0 && invalidBookingRefs === 0;

    results.push({
      category: "Data Integrity",
      passed: dataIntegrity,
      message: dataIntegrity ? "✅ All references are valid" : "❌ Found invalid references",
      details: {
        sitesWithInvalidProperty: invalidPropertyRefs,
        bookingsWithInvalidRefs: invalidBookingRefs,
      },
    });

    // Print Summary
    console.log("\n" + "=".repeat(70));
    console.log("📊 VALIDATION SUMMARY");
    console.log("=".repeat(70) + "\n");

    const allPassed = results.every((r) => r.passed);

    results.forEach((result) => {
      console.log(`${result.passed ? "✅" : "❌"} ${result.category}`);
      console.log(`   ${result.message}`);
      if (result.details) {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      }
      console.log();
    });

    console.log("=".repeat(70));
    console.log(
      allPassed
        ? "🎉 VALIDATION PASSED - Migration successful!"
        : "⚠️  VALIDATION FAILED - Please review errors above"
    );
    console.log("=".repeat(70) + "\n");

    if (!allPassed) {
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Validation failed with error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
  }
}

// Run validation
validate();
