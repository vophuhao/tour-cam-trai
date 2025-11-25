/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updateCustomerInfo } from '@/lib/api';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';

type Member = { fullname: string; age: number | ''; type: 'adult' | 'child' | 'baby' };
type Representative = { fullname: string; phone: string; age?: number | ''; type?: 'adult' | 'child' | 'baby'; email?: string; notes?: string };
type Group = {
    representative: Representative;
    members: Member[];
    paymentStatus: 'pending' | 'paid' | 'failed';
    notes?: string;
};
type FormValues = {
    groups: Group[];
};

export type TourSchedule = {
    _id: string;
    code?: string;
    tour: { name?: string } | string;
    dateFrom?: string;
    dateTo?: string;
    availableSeats?: number;
    note?: string;
    customers?: any;
    createdAt?: string;
};

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    tour?: TourSchedule | null;
    onSaved?: (data: any) => void;
};

/* Component con: xử lý members cho 1 đoàn => giữ useFieldArray ở 1 vị trí cố định */
function GroupEditor({
    control,
    register,
    formErrors,
    groupIndex,
    onRemoveGroup,
    seatsRemaining,
}: {
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
    formErrors: FieldErrors<FormValues>;
    groupIndex: number;
    onRemoveGroup: (idx: number) => void;
    seatsRemaining: number;
}) {
    const { fields: memberFields, append: appendMember, remove: removeMember } = useFieldArray({
        control,
        name: `groups.${groupIndex}.members`,
    });

    const handleAppendMember = () => {
        if (seatsRemaining <= 0) {
            toast.error('Không đủ chỗ trống để thêm thành viên.');
            return;
        }
        appendMember({ fullname: '', age: '', type: 'adult' });
    };

    return (
        <div className="mt-3">
            <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium">Danh sách thành viên</div>
                <div className="flex items-center gap-2">
                    <Button size="sm" type="button" onClick={handleAppendMember} disabled={seatsRemaining <= 0}>+ Thêm</Button>
                </div>
            </div>

            <div className="space-y-3">
                {memberFields.length === 0 && <div className="text-sm text-muted-foreground">Chưa có thành viên — thêm 1 để bắt đầu.</div>}

                {memberFields.map((m, mIdx) => (
                    <div key={m.id} className="grid grid-cols-12 gap-2 items-end border rounded-md p-3">
                        <div className="col-span-6">
                            <Label className="text-xs">Họ tên</Label>
                            <Controller
                                name={`groups.${groupIndex}.members.${mIdx}.fullname` as const}
                                control={control}
                                rules={{ required: 'Vui lòng nhập tên' }}
                                render={({ field }) => <Input {...field} className="h-10" />}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label className="text-xs">Tuổi</Label>
                            <Controller
                                name={`groups.${groupIndex}.members.${mIdx}.age` as const}
                                control={control}
                                render={({ field }) => <Input {...field} type="number" min={0} className="h-10" />}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label className="text-xs">Loại</Label>
                            <Controller
                                name={`groups.${groupIndex}.members.${mIdx}.type` as const}
                                control={control}
                                render={({ field }) => (
                                    <select {...field} className="w-full rounded-md border px-2 py-2 h-10">
                                        <option value="adult">Người lớn</option>
                                        <option value="child">Trẻ em</option>
                                        <option value="baby">Em bé</option>
                                    </select>
                                )}
                            />
                        </div>

                        <div className="col-span-2 flex justify-end">
                            <Button size="sm" type="button" variant="destructive" onClick={() => removeMember(mIdx)}>Xóa</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function TourBookingDetailModal({ open, onOpenChange, tour, onSaved }: Props) {
    const { register, control, handleSubmit, reset, watch, formState } = useForm<FormValues>({
        defaultValues: {
            groups: [
                {
                    representative: { fullname: '', phone: '', age: '', type: 'adult', email: '', notes: '' },
                    members: [{ fullname: '', age: '', type: 'adult' }],
                    paymentStatus: 'pending',
                    notes: '',
                },
            ],
        },
    });

    const {
        fields: groupFields,
        append: appendGroup,
        remove: removeGroup,
    } = useFieldArray({ control, name: 'groups' });

    useEffect(() => {
        if (!open) return;

        const c = tour?.customers;

        // no customers -> reset to single empty group
        if (!c) {
            reset({
                groups: [
                    {
                        representative: { fullname: '', phone: '', age: '', type: 'adult', email: '', notes: '' },
                        members: [{ fullname: '', age: '', type: 'adult' }],
                        paymentStatus: 'pending',
                        notes: '',
                    },
                ],
            });
            return;
        }

        // customers is already an array of CustomerInfo (server schema)
        if (Array.isArray(c)) {
            reset({
                groups: c.map((grp: any) => ({
                    representative: {
                        fullname: grp.representative?.fullname ?? '',
                        phone: grp.representative?.phone ?? '',
                        age: grp.representative?.age ?? '',
                        type: grp.representative?.type ?? 'adult',
                        email: grp.representative?.email ?? '',
                        notes: grp.representative?.notes ?? '',
                    },
                    members:
                        Array.isArray(grp.members) && grp.members.length
                            ? grp.members.map((m: any) => ({ fullname: m.fullname ?? '', age: m.age ?? '', type: m.type ?? 'adult' }))
                            : [{ fullname: '', age: '', type: 'adult' }],
                    paymentStatus: grp.paymentStatus ?? 'pending',
                    notes: grp.notes ?? '',
                })),
            });
            return;
        }

        // backward-compat: single customerInfo object or object with .groups
        if (typeof c === 'object') {
            if (Array.isArray((c as any).groups)) {
                reset({ groups: (c as any).groups });
                return;
            }
            reset({
                groups: [
                    {
                        representative: {
                            fullname: (c as any).representative?.fullname ?? '',
                            phone: (c as any).representative?.phone ?? '',
                            age: (c as any).representative?.age ?? '',
                            type: (c as any).representative?.type ?? 'adult',
                            email: (c as any).representative?.email ?? '',
                            notes: (c as any).representative?.notes ?? '',
                        },
                        members:
                            Array.isArray((c as any).members) && (c as any).members.length
                                ? (c as any).members
                                : [{ fullname: '', age: '', type: 'adult' }],
                        paymentStatus: (c as any).paymentStatus ?? 'pending',
                        notes: (c as any).notes ?? '',
                    },
                ],
            });
            return;
        }

        // fallback
        reset({
            groups: [
                {
                    representative: { fullname: '', phone: '', age: '', type: 'adult', email: '', notes: '' },
                    members: [{ fullname: '', age: '', type: 'adult' }],
                    paymentStatus: 'pending',
                    notes: '',
                },
            ],
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, tour, reset]);

    const groups = watch('groups') || [];

    // seats used counts: 1 representative per group + members length
    const seatsUsed = (groups as any[]).reduce((acc, g) => {
        const membersCount = Array.isArray(g.members) ? g.members.length : 0;
        return acc + 1 + membersCount;
    }, 0);

    const availableSeats = typeof tour?.availableSeats === 'number' ? tour.availableSeats : Infinity;
    const seatsRemaining = Math.max(0, availableSeats - seatsUsed);

    const totals = groups.reduce(
        (acc, g: any) => {
            const m = Array.isArray(g.members) ? g.members : [];
            m.forEach((p: any) => {
                if (p.type === 'adult') acc.adults += 1;
                if (p.type === 'child') acc.children += 1;
                if (p.type === 'baby') acc.babies += 1;
                acc.total += 1;
            });
            // include representatives in totals.total (but not in adults/children/babies breakdown)
            acc.total += 1; // representative counts as 1 person
            return acc;
        },
        { adults: 0, children: 0, babies: 0, total: 0 }
    );

    const onSubmit = async (vals: FormValues) => {
        if (!tour?._id) {
            toast.error('Không có tour để thêm khách.');
            return;
        }

        // Validate representative presence
        for (let i = 0; i < vals.groups.length; i++) {
            const rep = vals.groups[i]?.representative;
            if (!rep || !rep.fullname || !rep.phone) {
                toast.error(`Đoàn #${i + 1}: Vui lòng nhập họ tên và số điện thoại đại diện.`);
                return;
            }
        }

        // prevent submit if exceed seats
        const computedSeats = vals.groups.reduce((acc, g) => acc + 1 + (Array.isArray(g.members) ? g.members.length : 0), 0);
        if (computedSeats > availableSeats) {
            toast.error(`Tổng số khách (${computedSeats}) vượt quá số chỗ còn lại (${availableSeats}). Vui lòng giảm bớt.`);
            return;
        }

        // Build groupsPayload matching server CustomerInfo schema (array)
        const groupsPayload = vals.groups.map((g) => {
            const members = Array.isArray(g.members)
                ? g.members.map((m) => ({
                      fullname: m.fullname ?? '',
                      age: Number(m.age) || 0,
                      type: m.type ?? 'adult',
                  }))
                : [];

            const totalAdults = members.filter((m) => m.type === 'adult').length;
            const totalChildren = members.filter((m) => m.type === 'child').length;
            const totalBabies = members.filter((m) => m.type === 'baby').length;
            const totalPeople = members.length + 1; // members + representative

            return {
                representative: {
                    fullname: g.representative?.fullname ?? '',
                    phone: g.representative?.phone ?? '',
                    age: (g.representative && g.representative.age !== undefined && g.representative.age !== '') ? Number(g.representative.age) : undefined,
                    type: (g.representative as any)?.type ?? 'adult',
                    email: g.representative?.email ?? '',
                    notes: g.representative?.notes ?? '',
                },
                members,
                paymentStatus: g.paymentStatus ?? 'pending',
                totalAdults,
                totalChildren,
                totalBabies,
                totalPeople,
                ...(g.notes ? { notes: g.notes } : {}),
            };
        });

        try {
            // send array of CustomerInfo to server (TourB.customers)
            const res = await updateCustomerInfo(tour._id, groupsPayload);
            if (!res.success) throw new Error(res.message || 'Lỗi khi lưu thông tin khách hàng');
            toast.success('Lưu thông tin khách hàng thành công!');
            onSaved?.(res.data ?? res);
            onOpenChange(false);
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message ?? 'Lỗi khi lưu');
        }
    };

    const buildFlatRows = () => {
        const g = watch('groups') || [];
        const rows = (g as any[]).flatMap((group, gi) =>
            (Array.isArray(group.members) ? group.members : []).map((m: any) => ({
                group: gi + 1,
                representativeName: group.representative?.fullname ?? '',
                representativePhone: group.representative?.phone ?? '',
                representativeEmail: group.representative?.email ?? '',
                representativeAge: group.representative?.age ?? '',
                representativeType: group.representative?.type ?? '',
                groupPaymentStatus: group.paymentStatus ?? '',
                groupNotes: group.notes ?? '',
                memberName: m.fullname ?? '',
                memberAge: m.age ?? '',
                memberType: m.type ?? '',
            }))
        );
        return rows;
    };
    const exportToExcel = () => {
        try {
            const rows = buildFlatRows();
            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Customers');
            const filename = `customers_${(tour?._id) ?? 'export'}.xlsx`;
            XLSX.writeFile(wb, filename);
        } catch (err) {
            console.error('Export Excel error', err);
            toast.error('Xuất Excel thất bại');
        }
    };

    const exportToPdf = async () => {
        try {
            const groups = watch("groups") || [];

            const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
                let binary = "";
                const bytes = new Uint8Array(buffer);
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return btoa(binary);
            };

            // Init PDF
            const doc = new jsPDF({ unit: "pt", format: "a4" });
            const margin = 40;
            let cursorY = margin;

            // Load Unicode font
            try {
                const fontResp = await fetch("/fonts/DejaVuSans.ttf");
                if (fontResp.ok) {
                    const buf = await fontResp.arrayBuffer();
                    const base64 = arrayBufferToBase64(buf);
                    (doc as any).addFileToVFS("DejaVuSans.ttf", base64);
                    (doc as any).addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
                    doc.setFont("DejaVuSans", "normal");
                } else {
                    doc.setFont("helvetica");
                }
            } catch (err) {
                doc.setFont("helvetica");
            }

            // ===== HEADER =====
            doc.setFontSize(18);
            doc.text("DANH SÁCH KHÁCH THAM GIA TOUR", margin, cursorY);
            cursorY += 26;

            doc.setFontSize(12);
            const tourTitle = typeof tour?.tour === "object" ? (tour.tour as any)?.name : tour?.tour ?? "";
            doc.text(`Tên tour: ${tourTitle || "-"}`, margin, cursorY);
            cursorY += 18;

            const dateFrom = tour?.dateFrom ? new Date(tour.dateFrom).toLocaleDateString() : "-";
            const dateTo = tour?.dateTo ? new Date(tour.dateTo).toLocaleDateString() : "-";

            doc.text(`Mã tour: ${tour?.code ?? "-"}`, margin, cursorY);
            doc.text(`Ngày đi: ${dateFrom} → ${dateTo}`, margin + 260, cursorY);
            cursorY += 20;

            if (tour?.note) {
                doc.setFontSize(11);
                doc.text(`Ghi chú: ${tour.note}`, margin, cursorY);
                cursorY += 16;
            }

            cursorY += 10;

            // ===== TABLE =====
            const columns = [
                { header: "Đoàn", dataKey: "group" },
                { header: "Họ tên", dataKey: "name" },
                { header: "Tuổi", dataKey: "age" },
                { header: "Loại", dataKey: "type" },
                { header: "Đại diện", dataKey: "isRep" },
                { header: "SĐT", dataKey: "phone" },
            ];

            const rows: any[] = [];

            groups.forEach((group: any, idx: number) => {
                const rep = group.representative ?? {};

                // đại diện
                rows.push({
                    group: `#${idx + 1}`,
                    name: rep.fullname ?? "",
                    age: rep.age ?? "",
                    type: rep.type ?? "",
                    isRep: "✓",
                    phone: rep.phone ?? "",
                    _type: "rep",
                });

                // thành viên
                (group.members || []).forEach((m: any) =>
                    rows.push({
                        group: `#${idx + 1}`,
                        name: m.fullname ?? "",
                        age: m.age ?? "",
                        type: m.type ?? "",
                        isRep: "",
                        phone: "",
                        _type: "member",
                    })
                );

                // dòng meta
                const meta: string[] = [];
                if (group.paymentStatus) meta.push(`Thanh toán: ${group.paymentStatus}`);
                if (group.notes) meta.push(`Ghi chú: ${group.notes}`);

                if (meta.length > 0) {
                    rows.push({
                        group: `#${idx + 1}`,
                        name: meta.join("  ·  "),
                        age: "",
                        type: "",
                        isRep: "",
                        phone: "",
                        _type: "meta",
                    });
                }
            });

            autoTable(doc, {
                startY: cursorY,
                head: [columns.map(c => c.header)],
                body: rows.map(r => [
                    String(r.group ?? ""),
                    String(r.name ?? ""),
                    String(r.age ?? ""),
                    String(r.type ?? ""),
                    String(r.isRep ?? ""),
                    String(r.phone ?? "")
                ]),
                styles: {
                    font: "DejaVuSans",
                    fontStyle: "normal", // tránh bold không load
                    fontSize: 11,
                    cellPadding: 6,
                    lineColor: 220,
                },
                headStyles: {
                    fillColor: [230, 230, 230],
                    textColor: 20,
                    font: "DejaVuSans",
                    fontStyle: "normal", // header cũng dùng normal
                },
                columnStyles: {
                    0: { cellWidth: 45 },
                    1: { cellWidth: 230 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 65 },
                    4: { cellWidth: 55 },
                    5: { cellWidth: 95 },
                },
                didParseCell: (data: any) => {
                    data.cell.styles.font = "DejaVuSans";
                    data.cell.styles.fontStyle = "normal"; // tất cả cell, tránh fallback

                    const row = rows[data.row.index];
                    if (row?._type === "meta" && data.section === "body") {
                        if (data.column.index === 1) {
                            data.cell.colSpan = 5;
                            data.cell.styles.fontStyle = "italic";
                            data.cell.styles.textColor = 80;
                        } else data.cell.text = "";
                    }
                },
                didDrawPage: () => {
                    const page = doc.getNumberOfPages();
                    doc.setFontSize(10);
                    doc.text(
                        `Trang ${page}`,
                        doc.internal.pageSize.getWidth() - 60,
                        doc.internal.pageSize.getHeight() - 15
                    );
                },
            });

            doc.save(`tour_${tour?._id || "export"}.pdf`);
            toast.success("Xuất PDF thành công!");
        } catch (err) {
            console.error(err);
            toast.error("Xuất PDF thất bại");
        }
    };

    console.log('Rerender TourBookingDetailModal', tour);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[96vw] max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold">Chi tiết khách hàng — Quản lý đoàn</DialogTitle>
                </DialogHeader>

                <div className="mt-4 grid gap-6 ">
                    <Button type="button" variant="outline" onClick={exportToExcel}>Export Excel</Button>
                    <Button type="button" variant="outline" onClick={exportToPdf}>Export PDF</Button>

                    <main className="md:col-span-3">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Các đoàn / đại diện</h3>
                                <div className="flex gap-2 items-center">
                                    <div className="text-sm text-muted-foreground mr-2">Chỗ còn: <span className="font-medium">{seatsRemaining}</span></div>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            // adding a new group requires 2 seats: representative + one member (default)
                                            if (seatsRemaining < 2) {
                                                toast.error('Không đủ chỗ để thêm đoàn (cần ít nhất 2 chỗ: đại diện + 1 thành viên).');
                                                return;
                                            }
                                            appendGroup({
                                                representative: { fullname: '', phone: '', age: '', type: 'adult', email: '', notes: '' },
                                                members: [{ fullname: '', age: '', type: 'adult' }],
                                                paymentStatus: 'pending',
                                                notes: '',
                                            });
                                        }}
                                        disabled={seatsRemaining < 2}
                                    >
                                        Thêm đoàn
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {groupFields.map((g, gIdx) => {
                                    const memberCount = Array.isArray(groups[gIdx]?.members) ? groups[gIdx].members.length : 0;
                                    return (
                                        <div key={g.id} className="rounded-lg border bg-white p-5 shadow-sm">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-medium">Đoàn #{gIdx + 1}</div>
                                                            <div className="text-xs text-muted-foreground">Đại diện & thành viên</div>
                                                        </div>
                                                        <div className="ml-2">
                                                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 border">
                                                                Thành viên: <span className="ml-2 font-medium">{memberCount}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => removeGroup(gIdx)}>Xóa đoàn</Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-3">
                                                <div>
                                                    <Label className="text-xs">Họ tên (đại diện)</Label>
                                                    <Controller
                                                        name={`groups.${gIdx}.representative.fullname` as const}
                                                        control={control}
                                                        rules={{ required: 'Vui lòng nhập họ tên' }}
                                                        render={({ field }) => <Input {...field} className="h-11" />}
                                                    />
                                                    {formState.errors?.groups?.[gIdx]?.representative?.fullname && (
                                                        <p className="mt-1 text-xs text-red-600">{(formState.errors.groups as any)[gIdx].representative.fullname.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Số điện thoại (đại diện)</Label>
                                                    <Controller
                                                        name={`groups.${gIdx}.representative.phone` as const}
                                                        control={control}
                                                        rules={{ required: 'Vui lòng nhập số điện thoại' }}
                                                        render={({ field }) => <Input {...field} className="h-11" />}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Tuổi (đại diện)</Label>
                                                    <Controller
                                                        name={`groups.${gIdx}.representative.age` as const}
                                                        control={control}
                                                        render={({ field }) => <Input {...field} type="number" min={0} className="h-11" />}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Loại (đại diện)</Label>
                                                    <Controller
                                                        name={`groups.${gIdx}.representative.type` as const}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <select {...field} className="w-full rounded-md border px-2 py-2 h-11">
                                                                <option value="adult">Người lớn</option>
                                                                <option value="child">Trẻ em</option>
                                                                <option value="baby">Em bé</option>
                                                            </select>
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Email (đại diện)</Label>
                                                    <Controller
                                                        name={`groups.${gIdx}.representative.email` as const}
                                                        control={control}
                                                        render={({ field }) => <Input {...field} className="h-11" />}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Ghi chú (đại diện)</Label>
                                                    <Controller
                                                        name={`groups.${gIdx}.representative.notes` as const}
                                                        control={control}
                                                        render={({ field }) => <Input {...field} className="h-11" />}
                                                    />
                                                </div>
                                            </div>

                                            <GroupEditor
                                                control={control}
                                                register={register}
                                                formErrors={formState.errors}
                                                groupIndex={gIdx}
                                                onRemoveGroup={(idx) => removeGroup(idx)}
                                                seatsRemaining={seatsRemaining}
                                            />

                                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <Label className="text-xs">Trạng thái thanh toán (đoàn)</Label>
                                                    <Controller
                                                        name={`groups.${gIdx}.paymentStatus` as const}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <select {...field} className="w-full rounded-md border px-3 py-2 h-11">
                                                                <option value="pending">Chờ thanh toán</option>
                                                                <option value="paid">Đã thanh toán</option>
                                                                <option value="failed">Thất bại</option>
                                                            </select>
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Ghi chú chung (đoàn)</Label>
                                                    <Controller
                                                        name={`groups.${gIdx}.notes` as const}
                                                        control={control}
                                                        render={({ field }) => <Textarea {...field} className="min-h-[96px]" />}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">{totals.total}</span> khách tổng — Ng: {totals.adults} · Tr: {totals.children} · Em: {totals.babies}
                                </div>
                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                                    <Button type="submit">Lưu thông tin</Button>
                                </div>
                            </div>
                        </form>
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    );
}