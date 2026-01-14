/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import MDEditor from '@uiw/react-md-editor';
import { MapPin, Search, Loader2, X, Navigation2, Target } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Lazy load Map component
const MapPreview = dynamic(() => import('@/components/MapPreview'), {
    ssr: false,
    loading: () => (
        <div className="flex h-[300px] items-center justify-center rounded-lg border bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
    ),
});

const PROPERTY_TYPES = [
    { value: 'tent', label: 'Lều cắm trại' },
    { value: 'rv', label: 'RV/Caravan' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'glamping', label: 'Glamping' },
    { value: 'treehouse', label: 'Nhà trên cây' },
    { value: 'yurt', label: 'Yurt' },
    { value: 'other', label: 'Khác' },
];

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapboxFeature {
    id: string;
    place_type: string[];
    place_name: string;
    text: string;
    center: [number, number];
    context?: Array<{
        id: string;
        text: string;
    }>;
}

interface CampsiteFormValues {
    name: string;
    tagline?: string;
    description: string;
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
        lng: number;
        lat: number;
        accessInstructions?: string;
    };
    propertyType: string;
    capacity: {
        maxGuests: number;
        maxVehicles?: number;
        maxPets?: number;
    };
    pricing: any;
    rules: any;
    isActive: boolean;
    isInstantBook: boolean;
}

interface Step1Props {
    form: UseFormReturn<CampsiteFormValues>;
}

export function Step1BasicInfo({ form }: Step1Props) {
    const [addressQuery, setAddressQuery] = useState('');
    const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeocodingManual, setIsGeocodingManual] = useState(false);
    const [showInteractiveMap, setShowInteractiveMap] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Watch location fields
    const address = form.watch('location.address');
    const city = form.watch('location.city');
    const state = form.watch('location.state');
    const lng = form.watch('location.lng');
    const lat = form.watch('location.lat');

    // Auto-geocode when address/city/state changes
    const autoGeocodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    useEffect(() => {
        // Only auto-geocode if all fields are filled
        if (!address || !city || !state) return;
        
        // Clear previous timeout
        if (autoGeocodeDebounceRef.current) {
            clearTimeout(autoGeocodeDebounceRef.current);
        }

        // Debounce auto-geocoding
        autoGeocodeDebounceRef.current = setTimeout(() => {
            handleAutoGeocode();
        }, 1000);

        return () => {
            if (autoGeocodeDebounceRef.current) {
                clearTimeout(autoGeocodeDebounceRef.current);
            }
        };
    }, [address, city, state]);

    // Auto-geocode function - IMPROVED
    const handleAutoGeocode = async () => {
        if (!address || !city || !state || isGeocodingManual) return;

        const fullAddress = `${address}, ${city}, ${state}, Vietnam`;
        
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                fullAddress
            )}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=vi&country=VN&types=address,poi`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const newLng = feature.center[0];
                const newLat = feature.center[1];
                
                // Only update if significantly different (avoid infinite loop)
                const currentLng = form.getValues('location.lng');
                const currentLat = form.getValues('location.lat');
                
                const distance = Math.sqrt(
                    Math.pow(newLng - currentLng, 2) + 
                    Math.pow(newLat - currentLat, 2)
                );
                
                // Update if distance > 0.001 degrees (~111m)
                if (distance > 0.001) {
                    form.setValue('location.lng', newLng, { shouldValidate: true });
                    form.setValue('location.lat', newLat, { shouldValidate: true });
                }
            }
        } catch (error) {
            console.error('Auto-geocoding error:', error);
        }
    };

    // Manual geocode button - IMPROVED
    const handleManualGeocode = async () => {
        if (!address || !city || !state) {
            toast.error('Vui lòng nhập đủ địa chỉ, thành phố và tỉnh');
            return;
        }

        const fullAddress = `${address}, ${city}, ${state}, Vietnam`;
        setIsGeocodingManual(true);

        try {
            // Try with address type first for more precision
            let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                fullAddress
            )}.json?access_token=${MAPBOX_TOKEN}&limit=5&language=vi&country=VN&types=address,poi`;

            let response = await fetch(url);
            let data = await response.json();

            // If no address found, try with broader search
            if (!data.features || data.features.length === 0) {
                url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    fullAddress
                )}.json?access_token=${MAPBOX_TOKEN}&limit=5&language=vi&country=VN`;
                
                response = await fetch(url);
                data = await response.json();
            }

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                form.setValue('location.lng', feature.center[0], { shouldValidate: true });
                form.setValue('location.lat', feature.center[1], { shouldValidate: true });
                
                toast.success(
                    `Đã cập nhật tọa độ!\n📍 ${feature.place_name}`,
                    { duration: 4000 }
                );
            } else {
                toast.error('Không tìm thấy tọa độ cho địa chỉ này');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error('Lỗi khi tìm tọa độ');
        } finally {
            setIsGeocodingManual(false);
        }
    };

    // Fetch Mapbox suggestions
    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSuggestions([]);
            return;
        }

        if (!MAPBOX_TOKEN) {
            console.error('Mapbox token not configured');
            toast.error('Chưa cấu hình Mapbox token');
            return;
        }

        setIsLoading(true);
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                query
            )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&language=vi&country=VN&types=place,locality,neighborhood,address,poi`;

            const response = await fetch(url);
            const data = await response.json();

            setSuggestions(data.features || []);
        } catch (error) {
            console.error('Geocoding error:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced fetch
    const debouncedFetch = useCallback(
        (query: string) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                fetchSuggestions(query);
            }, 300);
        },
        [fetchSuggestions]
    );

    // Handle address input change
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddressQuery(value);
        debouncedFetch(value);
        setShowSuggestions(true);
    };

    // Handle selecting a suggestion - IMPROVED
    const handleSelectSuggestion = (feature: MapboxFeature) => {
        // Extract proper address components
        let address = '';
        let city = '';
        let state = '';
        
        // Get address from feature text or properties
        address = feature.text;
        
        // Parse context for city and state
        if (feature.context) {
            // Find place (city/district)
            const placeContext = feature.context.find(c => 
                c.id.startsWith('place') || c.id.startsWith('locality')
            );
            
            // Find region (province/state)
            const regionContext = feature.context.find(c => 
                c.id.startsWith('region')
            );
            
            // Find district
            const districtContext = feature.context.find(c => 
                c.id.startsWith('district')
            );

            // Priority: place > district for city
            city = placeContext?.text || districtContext?.text || feature.text;
            state = regionContext?.text || '';
        }

        // Fallback if context is missing
        if (!city && feature.place_type.includes('place')) {
            city = feature.text;
        }

        // Set form values
        form.setValue('location.address', address, { shouldValidate: true });
        form.setValue('location.city', city, { shouldValidate: true });
        form.setValue('location.state', state, { shouldValidate: true });
        form.setValue('location.country', 'Vietnam', { shouldValidate: true });
        form.setValue('location.lng', feature.center[0], { shouldValidate: true });
        form.setValue('location.lat', feature.center[1], { shouldValidate: true });

        // Clear search
        setAddressQuery('');
        setSuggestions([]);
        setShowSuggestions(false);

        toast.success('Đã tự động điền địa chỉ và tọa độ!');
    };

    const getPlaceIcon = (placeTypes: string[]) => {
        if (placeTypes.includes('place') || placeTypes.includes('locality')) return '🏙️';
        if (placeTypes.includes('neighborhood')) return '🏘️';
        if (placeTypes.includes('address')) return '📍';
        if (placeTypes.includes('poi')) return '🏢';
        return '📌';
    };

    // Handle map location change (from interactive map)
    const handleMapLocationChange = (newLat: number, newLng: number) => {
        form.setValue('location.lat', newLat, { shouldValidate: true });
        form.setValue('location.lng', newLng, { shouldValidate: true });
        toast.success(`Đã cập nhật tọa độ: ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
    };

    // Reverse geocode to get address from coordinates
    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=vi&country=VN`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                
                // Extract address components
                const address = feature.text || '';
                let city = '';
                let state = '';

                if (feature.context) {
                    const placeContext = feature.context.find((c: any) => 
                        c.id.startsWith('place') || c.id.startsWith('locality')
                    );
                    const regionContext = feature.context.find((c: any) => 
                        c.id.startsWith('region')
                    );

                    city = placeContext?.text || '';
                    state = regionContext?.text || '';
                }

                // Update form
                if (address) form.setValue('location.address', address, { shouldValidate: true });
                if (city) form.setValue('location.city', city, { shouldValidate: true });
                if (state) form.setValue('location.state', state, { shouldValidate: true });

                toast.success('Đã tự động điền địa chỉ từ tọa độ!');
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }
    };

    // Check if coordinates are valid
    const hasValidCoordinates = lng !== 0 && lat !== 0 && !isNaN(lng) && !isNaN(lat);

    return (
        <div className="space-y-6">
            {/* Name & Status */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên địa điểm *</FormLabel>
                            <FormControl>
                                <Input placeholder="VD: Khu cắm trại Đà Lạt" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slogan</FormLabel>
                            <FormControl>
                                <Input placeholder="VD: Trải nghiệm cắm trại độc đáo" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Description */}
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mô tả *</FormLabel>
                        <FormControl>
                            <div data-color-mode="light">
                                <MDEditor
                                    value={field.value || ''}
                                    onChange={value => field.onChange(value || '')}
                                    preview="edit"
                                    height={200}
                                    visibleDragbar={false}
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Location */}
            <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                        <h3 className="text-lg font-semibold">Địa điểm</h3>
                    </div>
                    <div className="flex gap-2">
                        {address && city && state && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleManualGeocode}
                                disabled={isGeocodingManual}
                            >
                                {isGeocodingManual ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang tìm...
                                    </>
                                ) : (
                                    <>
                                        <Navigation2 className="mr-2 h-4 w-4" />
                                        Cập nhật tọa độ
                                    </>
                                )}
                            </Button>
                        )}
                        {hasValidCoordinates && (
                            <Button
                                type="button"
                                variant={showInteractiveMap ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowInteractiveMap(!showInteractiveMap)}
                            >
                                <Target className="mr-2 h-4 w-4" />
                                {showInteractiveMap ? 'Đang chọn vị trí' : 'Chọn trên bản đồ'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Address Search */}
                <div className="relative">
                    <Label className="mb-2 block">Tìm kiếm địa chỉ nhanh</Label>
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Nhập địa chỉ để tìm kiếm..."
                            value={addressQuery}
                            onChange={handleAddressChange}
                            onFocus={() => addressQuery.length >= 2 && setShowSuggestions(true)}
                            className="pr-10 pl-9"
                        />
                        {addressQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setAddressQuery('');
                                    setSuggestions([]);
                                    setShowSuggestions(false);
                                }}
                                className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 hover:bg-gray-100"
                            >
                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                        {isLoading && (
                            <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowSuggestions(false)}
                            />
                            <div className="absolute top-full left-0 right-0 z-20 mt-2 max-h-[300px] overflow-y-auto rounded-lg border bg-white shadow-lg">
                                {suggestions.map(feature => (
                                    <button
                                        key={feature.id}
                                        type="button"
                                        onClick={() => handleSelectSuggestion(feature)}
                                        className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-gray-50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                            <span className="text-xl">
                                                {getPlaceIcon(feature.place_type)}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate font-semibold text-gray-900">
                                                {feature.text}
                                            </div>
                                            <div className="truncate text-sm text-gray-500">
                                                {feature.place_name}
                                            </div>
                                        </div>
                                        <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* No results */}
                    {showSuggestions &&
                        suggestions.length === 0 &&
                        !isLoading &&
                        addressQuery.length >= 2 && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowSuggestions(false)}
                                />
                                <div className="absolute top-full left-0 right-0 z-20 mt-2 rounded-lg border bg-white p-4 text-center text-sm text-gray-500 shadow-lg">
                                    Không tìm thấy địa điểm phù hợp
                                </div>
                            </>
                        )}
                </div>

                {/* Interactive Map (shown when button clicked) */}
                {showInteractiveMap && hasValidCoordinates && (
                    <div className="space-y-2 rounded-lg border-2 border-emerald-500 bg-emerald-50/50 p-4">
                        <div className="flex items-center justify-between">
                            <Label className="font-semibold text-emerald-900">
                                Chọn vị trí chính xác trên bản đồ
                            </Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                    await reverseGeocode(lat, lng);
                                    setShowInteractiveMap(false);
                                }}
                            >
                                Xác nhận vị trí
                            </Button>
                        </div>
                        <MapPreview 
                            lat={lat} 
                            lng={lng} 
                            zoom={18} 
                            height={500}
                            interactive={true}
                            onLocationChange={handleMapLocationChange}
                        />
                        <p className="text-sm text-emerald-700">
                            📍 Tọa độ hiện tại: {lat.toFixed(6)}, {lng.toFixed(6)}
                        </p>
                    </div>
                )}

                {/* Manual Input Fields */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="location.address"
                        render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                                <FormLabel>Địa chỉ *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Số nhà, tên đường" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location.city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Thành phố *</FormLabel>
                                <FormControl>
                                    <Input placeholder="VD: Đà Lạt" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location.state"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tỉnh/Thành *</FormLabel>
                                <FormControl>
                                    <Input placeholder="VD: Lâm Đồng" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location.lng"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kinh độ (Longitude)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        placeholder="Tự động điền"
                                        {...field}
                                        onChange={e =>
                                            field.onChange(parseFloat(e.target.value) || 0)
                                        }
                                        value={field.value || ''}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location.lat"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vĩ độ (Latitude)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        placeholder="Tự động điền"
                                        {...field}
                                        onChange={e =>
                                            field.onChange(parseFloat(e.target.value) || 0)
                                        }
                                        value={field.value || ''}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location.accessInstructions"
                        render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                                <FormLabel>Hướng dẫn đường đi</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Mô tả cách đến địa điểm..."
                                        rows={3}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Map Preview (read-only) */}
                {!showInteractiveMap && hasValidCoordinates && (
                    <div className="space-y-2">
                        <Label>Xem trước bản đồ</Label>
                        <MapPreview lat={lat} lng={lng} zoom={15} height={300} />
                        <p className="text-sm text-gray-500">
                            📍 Vị trí: {lat.toFixed(6)}, {lng.toFixed(6)}
                        </p>
                    </div>
                )}
            </div>

            {/* Property Type & Capacity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Loại hình *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại hình" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {PROPERTY_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="capacity.maxGuests"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Số khách tối đa *</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={1}
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="capacity.maxVehicles"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Số xe tối đa</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="capacity.maxPets"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Số thú cưng tối đa</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Settings */}
            <div className="flex gap-6">
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Đang hoạt động</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isInstantBook"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Đặt ngay (Instant Book)</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}