'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface Amenity {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    category: 'basic' | 'comfort' | 'safety' | 'outdoor' | 'special';
    isActive: boolean;
}

interface Activity {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    category: 'water' | 'hiking' | 'wildlife' | 'winter' | 'adventure' | 'relaxation' | 'other';
    isActive: boolean;
}

interface Step4Props {
    amenities: Amenity[];
    activities: Activity[];
    selectedAmenities: string[];
    setSelectedAmenities: (ids: string[]) => void;
    selectedActivities: string[];
    setSelectedActivities: (ids: string[]) => void;
}

const amenityCategoryLabels: Record<string, string> = {
    basic: 'Tiện nghi cơ bản',
    comfort: 'Tiện nghi cao cấp',
    safety: 'An toàn & Bảo mật',
    outdoor: 'Ngoài trời',
    special: 'Đặc biệt',
};

const activityCategoryLabels: Record<string, string> = {
    water: 'Hoạt động nước',
    hiking: 'Leo núi & Đi bộ',
    wildlife: 'Động vật hoang dã',
    winter: 'Hoạt động mùa đông',
    adventure: 'Mạo hiểm',
    relaxation: 'Thư giãn',
    other: 'Khác',
};

const categoryIcons: Record<string, string> = {
    basic: '🏕️',
    comfort: '✨',
    safety: '🛡️',
    outdoor: '🌲',
    special: '⭐',
    water: '🏊',
    hiking: '🥾',
    wildlife: '🦌',
    winter: '⛷️',
    adventure: '🧗',
    relaxation: '🧘',
    other: '🎯',
};

export function Step4Amenities({
    amenities,
    activities,
    selectedAmenities,
    setSelectedAmenities,
    selectedActivities,
    setSelectedActivities,
}: Step4Props) {
    const toggleAmenity = (id: string) => {
        setSelectedAmenities(
            selectedAmenities.includes(id)
                ? selectedAmenities.filter(a => a !== id)
                : [...selectedAmenities, id],
        );
    };

    const toggleActivity = (id: string) => {
        setSelectedActivities(
            selectedActivities.includes(id)
                ? selectedActivities.filter(a => a !== id)
                : [...selectedActivities, id],
        );
    };

    const toggleAllAmenitiesInCategory = (category: string) => {
        const categoryAmenities = amenities.filter(a => a.category === category);
        const categoryIds = categoryAmenities.map(a => a._id);
        const allSelected = categoryIds.every(id => selectedAmenities.includes(id));

        if (allSelected) {
            setSelectedAmenities(selectedAmenities.filter(id => !categoryIds.includes(id)));
        } else {
            setSelectedAmenities([...new Set([...selectedAmenities, ...categoryIds])]);
        }
    };

    const toggleAllActivitiesInCategory = (category: string) => {
        const categoryActivities = activities.filter(a => a.category === category);
        const categoryIds = categoryActivities.map(a => a._id);
        const allSelected = categoryIds.every(id => selectedActivities.includes(id));

        if (allSelected) {
            setSelectedActivities(selectedActivities.filter(id => !categoryIds.includes(id)));
        } else {
            setSelectedActivities([...new Set([...selectedActivities, ...categoryIds])]);
        }
    };

    const amenitiesByCategory = amenities.reduce((acc, amenity) => {
        if (!acc[amenity.category]) {
            acc[amenity.category] = [];
        }
        acc[amenity.category].push(amenity);
        return acc;
    }, {} as Record<string, Amenity[]>);

    const activitiesByCategory = activities.reduce((acc, activity) => {
        if (!acc[activity.category]) {
            acc[activity.category] = [];
        }
        acc[activity.category].push(activity);
        return acc;
    }, {} as Record<string, Activity[]>);

    return (
        <div className="space-y-8">
            {/* Amenities Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Tiện nghi</h3>
                        <p className="text-sm text-gray-500">
                            Chọn các tiện nghi có tại địa điểm của bạn
                        </p>
                    </div>
                    <Badge variant="outline" className="text-base">
                        {selectedAmenities.length}/{amenities.length}
                    </Badge>
                </div>

                {Object.keys(amenitiesByCategory).length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center">
                        <p className="text-gray-500">Chưa có tiện nghi nào trong hệ thống</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(amenitiesByCategory).map(([category, items]) => {
                            const selectedCount = items.filter(a => selectedAmenities.includes(a._id)).length;
                            const allSelected = items.length > 0 && selectedCount === items.length;

                            return (
                                <div key={category} className="rounded-lg border bg-white p-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{categoryIcons[category]}</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    {amenityCategoryLabels[category]}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {selectedCount}/{items.length} đã chọn
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleAllAmenitiesInCategory(category)}
                                        >
                                            {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {items.map(amenity => (
                                            <label
                                                key={amenity._id}
                                                htmlFor={`amenity-${amenity._id}`}
                                                className={cn(
                                                    'group relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md',
                                                    selectedAmenities.includes(amenity._id)
                                                        ? 'border-emerald-500 bg-emerald-50'
                                                        : 'border-gray-200 hover:border-gray-300',
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        id={`amenity-${amenity._id}`}
                                                        checked={selectedAmenities.includes(amenity._id)}
                                                        onCheckedChange={() => toggleAmenity(amenity._id)}
                                                        className="mt-0.5"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            {amenity.icon && (
                                                                <span className="text-base">{amenity.icon}</span>
                                                            )}
                                                            <span className="font-medium text-gray-900 text-sm">
                                                                {amenity.name}
                                                            </span>
                                                        </div>
                                                        {amenity.description && (
                                                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                                                {amenity.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Activities Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Hoạt động</h3>
                        <p className="text-sm text-gray-500">
                            Chọn các hoạt động khách có thể tham gia
                        </p>
                    </div>
                    <Badge variant="outline" className="text-base">
                        {selectedActivities.length}/{activities.length}
                    </Badge>
                </div>

                {Object.keys(activitiesByCategory).length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center">
                        <p className="text-gray-500">Chưa có hoạt động nào trong hệ thống</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(activitiesByCategory).map(([category, items]) => {
                            const selectedCount = items.filter(a => selectedActivities.includes(a._id)).length;
                            const allSelected = items.length > 0 && selectedCount === items.length;

                            return (
                                <div key={category} className="rounded-lg border bg-white p-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{categoryIcons[category]}</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    {activityCategoryLabels[category]}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {selectedCount}/{items.length} đã chọn
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleAllActivitiesInCategory(category)}
                                        >
                                            {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {items.map(activity => (
                                            <label
                                                key={activity._id}
                                                htmlFor={`activity-${activity._id}`}
                                                className={cn(
                                                    'group relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md',
                                                    selectedActivities.includes(activity._id)
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300',
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        id={`activity-${activity._id}`}
                                                        checked={selectedActivities.includes(activity._id)}
                                                        onCheckedChange={() => toggleActivity(activity._id)}
                                                        className="mt-0.5"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            {activity.icon && (
                                                                <span className="text-base">{activity.icon}</span>
                                                            )}
                                                            <span className="font-medium text-gray-900 text-sm">
                                                                {activity.name}
                                                            </span>
                                                        </div>
                                                        {activity.description && (
                                                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                                                {activity.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>           
        </div>
    );
}