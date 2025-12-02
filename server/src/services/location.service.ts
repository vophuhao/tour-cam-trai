import LocationModel, { LocationDocument } from "@/models/location.model";
import { PaginationType } from "@/types";
import { appAssert } from "@/utils";
import { ErrorFactory } from "@/errors";

export type CreateLocationInput = {
  name: string;
  isActive?: boolean | undefined;
};

export type UpdateLocationInput = {
  id: string;
  name?: string;
  isActive?: boolean;
};

export default class LocationService {
  // Create
  async createLocation(data: CreateLocationInput): Promise<LocationDocument> {
    return LocationModel.create(data);
  }

  // Pagination
  async getLocationsPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: LocationDocument[]; pagination: PaginationType }> {
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const total = await LocationModel.countDocuments(query);

    const data = await LocationModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Get all (không phân trang)
  async getLocations(): Promise<LocationDocument[]> {
    return LocationModel.find().exec();
  }

  // Get by ID
  async getLocationById(id: string): Promise<LocationDocument | null> {
    return LocationModel.findById(id).exec();
  }

  // Update
  async updateLocation(data: UpdateLocationInput): Promise<LocationDocument | null> {
    const location = await LocationModel.findById(data.id);
    if (!location) return null;

    if (data.name !== undefined) location.name = data.name;
    if (data.isActive !== undefined) location.isActive = data.isActive;

    return location.save();
  }

  // Delete
  async deleteLocation(id: string): Promise<void> {
    const location = await LocationModel.findById(id);
    appAssert(location, ErrorFactory.resourceNotFound("Location"));
    await location.deleteOne();
  }
}
