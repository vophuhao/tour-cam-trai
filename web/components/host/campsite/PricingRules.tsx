/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Plus, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface Step3Props {
    form: UseFormReturn<any>;
    customRulesFields: any[];
    appendCustomRule: (value: string) => void;
    removeCustomRule: (index: number) => void;
}

export function Step3PricingRules({
    form,
    customRulesFields,
    appendCustomRule,
    removeCustomRule,
}: Step3Props) {
    return (
        <div className="space-y-6">
            {/* Pricing */}
            <div className="space-y-4 rounded-lg border p-6">
                <h3 className="text-lg font-semibold">Bảng giá</h3>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="pricing.basePrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá cơ bản/đêm *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="500000"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="pricing.weekendPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá cuối tuần/đêm</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="600000"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="pricing.cleaningFee"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phí dọn dẹp</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="100000"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="pricing.petFee"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phí thú cưng/con</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="50000"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="pricing.extraGuestFee"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phí khách thêm/người</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="100000"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Rules */}
            <div className="space-y-4 rounded-lg border p-6">
                <h3 className="text-lg font-semibold">Quy định</h3>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="rules.checkIn"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giờ check-in *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="time"
                                        placeholder="14:00"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rules.checkOut"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giờ check-out *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="time"
                                        placeholder="11:00"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rules.minNights"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số đêm tối thiểu *</FormLabel>
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
                        name="rules.maxNights"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số đêm tối đa</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        {...field}
                                        onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rules.quietHours"
                        render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                                <FormLabel>Giờ nghỉ ngơi</FormLabel>
                                <FormControl>
                                    <Input placeholder="VD: 22:00 - 07:00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="rules.allowPets"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Cho phép thú cưng</FormLabel>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rules.allowChildren"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Cho phép trẻ em</FormLabel>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rules.allowSmoking"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Cho phép hút thuốc</FormLabel>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Custom Rules */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Quy định khác</label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendCustomRule('')}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm
                        </Button>
                    </div>

                    {customRulesFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                            <Input
                                placeholder="Quy định..."
                                {...form.register(`rules.customRules.${index}` as const)}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCustomRule(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}