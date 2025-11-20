/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cancelOrder, getOrderById } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
export default function OrderDetailPage() {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const orderId = searchParams.get("id");
    const router = useRouter();
    const [openDialog, setOpenDialog] = useState(false);
    useEffect(() => {
        async function fetchOrder() {
            try {
                const res = await getOrderById(orderId as string);
                setOrder(res.data || null);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [orderId]);
    const handleCancelOrder = async () => {
        if (!order) return;
        const res = await cancelOrder(order._id);
        if (res.success) {
            toast.success("Hủy đơn hàng thành công");
            setOrder({ ...order, orderStatus: "cancelled" });
            setOpenDialog(false);
            router.back();
        } else {
            toast.error("Hủy đơn hàng thất bại: " + res.message);
        }
    };

    if (loading) return <p className="text-center mt-10">Đang tải...</p>;
    if (!order) return <p className="text-center mt-10">Không tìm thấy đơn hàng.</p>;

    const statusLabel = (status: string) => {
        switch (status) {
            case "pending":
            case "processing":
                return "Chờ xác nhận";
            case "confirmed":
                return "Đã xác nhận";
            case "shipping":
                return "Đang giao";
            case "completed":
                return "Hoàn thành";
            case "cancelled":
                return "Đã hủy";
            default:
                return status.toUpperCase();
        }
    };

    const statusVariant = (status: string) => {
        switch (status) {
            case "completed":
                return "secondary";
            case "cancelled":
                return "destructive";
            default:
                return "default";
        }
    };

    const canCancel = ["pending", "processing", "confirmed", "shipping"].includes(order.orderStatus);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <Card className="shadow-md">
                {/* Header: Mã đơn + trạng thái */}
                <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <CardTitle className="text-lg font-semibold">
                        Mã đơn: <span className="text-gray-700">{order.code}</span>
                    </CardTitle>
                    <Badge variant={statusVariant(order.orderStatus)} className="uppercase">
                        {statusLabel(order.orderStatus)}
                    </Badge>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Thông tin khách hàng */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Thông tin khách hàng</h3>
                        <div className="bg-muted/50 p-4 rounded-lg border space-y-1">
                            <div>Tên: {order.shippingAddress.fullName}</div>
                            <div>Số điện thoại: {order.shippingAddress.phone}</div>
                        </div>
                    </div>

                    {/* Địa chỉ giao hàng */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Địa chỉ giao hàng</h3>
                        <div className="bg-muted/50 p-4 rounded-lg border space-y-1">
                            <div>{order.shippingAddress.addressLine}</div>
                            {order.shippingAddress.district && <div>{order.shippingAddress.district}</div>}
                            <div>{order.shippingAddress.province}</div>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Sản phẩm</h3>
                        <ScrollArea className="max-h-64">
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div
                                        key={item.product.toString()}
                                        className="flex items-center gap-4 border p-3 rounded-lg"
                                    >
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-xs text-gray-500 rounded">
                                                No image
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.quantity} x {item.totalPrice.toLocaleString("vi-VN")}₫
                                            </div>
                                        </div>
                                        <div className="font-semibold text-red-600">
                                            {(item.totalPrice * item.quantity).toLocaleString("vi-VN")}₫
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <Separator />

                    {/* Tổng kết thanh toán */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Tổng kết</h3>
                        <div className="flex justify-between text-sm">
                            <span>Tạm tính:</span>
                            <span>{order.itemsTotal.toLocaleString("vi-VN")}₫</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Phí ship:</span>
                            <span>{order.shippingFee.toLocaleString("vi-VN")}₫</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Thuế:</span>
                            <span>{order.tax.toLocaleString("vi-VN")}₫</span>
                        </div>
                        {order.discount && order.discount > 0 && (
                            <div className="flex justify-between text-green-600 text-sm">
                                <span>Giảm giá:</span>
                                <span>-{order.discount.toLocaleString("vi-VN")}₫</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Tổng cộng:</span>
                            <span>{order.grandTotal.toLocaleString("vi-VN")}₫</span>
                        </div>
                    </div>

                    {/* Thanh toán & trạng thái */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-sm">Thanh toán</h3>
                            <div className="bg-muted/50 p-4 rounded-lg border space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Phương thức:</span>
                                    <span>{order.paymentMethod === "cod" ? "COD" : "Chuyển khoản"}</span>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Ghi chú đơn hàng */}
                    {order.orderNote && (
                        <div className="space-y-1">
                            <h3 className="font-semibold text-sm">Ghi chú</h3>
                            <div className="bg-muted/50 p-4 rounded-lg border text-sm">{order.orderNote}</div>
                        </div>
                    )}
                </CardContent>

                {/* Footer buttons */}
                <CardFooter className="flex flex-wrap gap-2 justify-end">
                    <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => router.back()}>
                        Quay lại
                    </Button>
                    {canCancel && (
                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="cursor-pointer" variant="destructive">
                                    Hủy đơn hàng
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
                                    <DialogDescription>
                                        Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setOpenDialog(false)}>
                                        Hủy
                                    </Button>
                                    <Button variant="destructive" onClick={handleCancelOrder}>
                                        Xác nhận
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}


                </CardFooter>
            </Card>
        </div>
    );
}
