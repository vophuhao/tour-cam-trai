/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    MapPin,
    DollarSign,
    Users,
    Star,
    TrendingUp,
    Shield,
    Heart,
    Calendar,
    Camera,
    CheckCircle2,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import Image from "next/image";
import { becomeHost } from "@/lib/client-actions";

// Validation schema
const hostFormSchema = z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(255),
    gmail: z.string().email("Email không hợp lệ").max(255),
    phone: z
        .string()
        .min(10, "Số điện thoại phải có ít nhất 10 số")
        .max(20)
        .regex(/^[0-9+\-() ]+$/, "Số điện thoại không hợp lệ")
        .optional()
        .or(z.literal("")),
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: "Bạn phải đồng ý với điều khoản",
    }),
});

type HostFormValues = z.infer<typeof hostFormSchema>;

export default function HostRegisterPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<HostFormValues>({
        resolver: zodResolver(hostFormSchema),
        defaultValues: {
            name: "",
            gmail: "",
            phone: "",
            agreeToTerms: false,
        },
    });

    const onSubmit = async (data: HostFormValues) => {
        try {
            setIsSubmitting(true);
            const { agreeToTerms, ...hostData } = data;

            const response = await becomeHost(hostData);

            if (!response.success) throw new Error("Đăng ký thất bại");

            toast.success("Đăng ký thành công!", {
                description: "Chúng tôi sẽ liên hệ với bạn sớm nhất.",
            });
            form.reset();
        } catch (error: any) {
            toast.error("Đăng ký thất bại", {
                description: error.message || "Vui lòng thử lại sau",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const benefits = [
        {
            icon: DollarSign,
            title: "Thu nhập thêm",
            description:
                "Biến đất trống thành nguồn thu nhập ổn định. Chủ đất trung bình kiếm được 5-15 triệu/tháng.",
        },
        {
            icon: Users,
            title: "Kết nối cộng đồng",
            description:
                "Gặp gỡ những người yêu thiên nhiên, chia sẻ niềm đam mê cắm trái.",
        },
        {
            icon: Shield,
            title: "An toàn & bảo vệ",
            description:
                "Bảo hiểm trách nhiệm lên đến 500 triệu đồng. Hỗ trợ 24/7 khi cần.",
        },
        {
            icon: Calendar,
            title: "Linh hoạt thời gian",
            description:
                "Bạn quyết định khi nào cho thuê. Tự do kiểm soát lịch trình của mình.",
        },
    ];

    const steps = [
        {
            number: "01",
            title: "Đăng ký thông tin",
            description: "Điền form đơn giản với thông tin cơ bản về bạn và đất đai.",
        },
        {
            number: "02",
            title: "Thiết lập địa điểm",
            description: "Thêm ảnh, mô tả và các tiện nghi của khu cắm trại.",
        },
        {
            number: "03",
            title: "Duyệt & đăng tải",
            description: "Đội ngũ của chúng tôi xem xét và phê duyệt địa điểm.",
        },
        {
            number: "04",
            title: "Đón khách & kiếm tiền",
            description: "Bắt đầu đón khách và nhận thanh toán hàng tuần.",
        },
    ];

    const stats = [
        { value: "10,000+", label: "Chủ đất" },
        { value: "8 triệu", label: "Thu nhập TB/tháng" },
        { value: "4.8★", label: "Đánh giá TB" },
        { value: "95%", label: "Tỷ lệ hài lòng" },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm">
                                <Sparkles className="h-4 w-4" />
                                <span>Tham gia cộng đồng 10,000+ chủ đất</span>
                            </div>

                            <h1 className="text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
                                Chia sẻ đất đai,
                                <br />
                                <span className="text-emerald-200">Thu nhập thêm</span>
                            </h1>

                            <p className="text-xl text-emerald-100 max-w-xl">
                                Biến khu đất của bạn thành điểm đến cắm trại yêu thích. An toàn, dễ
                                dàng và mang lại thu nhập ổn định.
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-6 pt-4 sm:grid-cols-4">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-3xl font-bold text-white">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-emerald-200 mt-1">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Button
                                    size="lg"
                                    className="bg-white text-emerald-700 hover:bg-emerald-50 h-14 px-8 text-lg font-semibold shadow-xl"
                                    onClick={() => {
                                        document.getElementById("registration-form")?.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                    }}
                                >
                                    Bắt đầu ngay
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-transparent border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg"
                                >
                                    Tìm hiểu thêm
                                </Button>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="relative h-[600px] hidden lg:block">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-3xl"></div>
                            <Image
                              src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80"
                                alt="Host camping"
                                fill
                                className="object-cover rounded-3xl shadow-2xl"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
                            Tại sao trở thành Host?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Hàng nghìn chủ đất đã tin tưởng chúng tôi để biến đất trống thành
                            nguồn thu nhập
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <div
                                    key={index}
                                    className="group relative p-8 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <div className="relative">
                                        <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
                            Cách thức hoạt động
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Chỉ 4 bước đơn giản để bắt đầu kiếm tiền từ đất đai của bạn
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="text-6xl font-bold text-emerald-100 mb-4">
                                    {step.number}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600">{step.description}</p>
                                {index < steps.length - 1 && (
                                    <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-emerald-300 w-8 h-8" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
                            Câu chuyện từ các Host
                        </h2>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                name: "Nguyễn Văn A",
                                location: "Đà Lạt, Lâm Đồng",
                                avatar: "/avatar1.jpg",
                                quote:
                                    "Sau 6 tháng, tôi đã có thêm 12 triệu/tháng từ khu đất trống. Rất đáng để thử!",
                                rating: 5,
                            },
                            {
                                name: "Trần Thị B",
                                location: "Đà Nẵng",
                                avatar: "/avatar2.jpg",
                                quote:
                                    "Được gặp nhiều người thú vị, chia sẻ đam mê thiên nhiên. Trải nghiệm tuyệt vời!",
                                rating: 5,
                            },
                            {
                                name: "Lê Minh C",
                                location: "Vũng Tàu, Bà Rịa",
                                avatar: "/avatar3.jpg",
                                quote:
                                    "Nền tảng dễ sử dụng, hỗ trợ nhiệt tình. Thu nhập ổn định mỗi tháng.",
                                rating: 5,
                            },
                        ].map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-5 h-5 fill-yellow-400 text-yellow-400"
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-700 italic mb-6 text-lg">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {testimonial.location}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Registration Form */}
            <section id="registration-form" className="py-20 bg-gray-50">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
                            Bắt đầu hành trình Host
                        </h2>
                        <p className="text-xl text-gray-600">
                            Điền thông tin để chúng tôi liên hệ và hỗ trợ bạn
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">
                                                Họ và tên <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Nguyễn Văn A"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className="h-12 text-base"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">
                                                Email <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="example@gmail.com"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className="h-12 text-base"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">
                                                Số điện thoại
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    placeholder="0123456789"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className="h-12 text-base"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="agreeToTerms"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm cursor-pointer">
                                                    Tôi đồng ý với{" "}
                                                    <a
                                                        href="/terms"
                                                        target="_blank"
                                                        className="text-emerald-600 hover:underline font-semibold"
                                                    >
                                                        Điều khoản dịch vụ
                                                    </a>{" "}
                                                    và{" "}
                                                    <a
                                                        href="/privacy"
                                                        target="_blank"
                                                        className="text-emerald-600 hover:underline font-semibold"
                                                    >
                                                        Chính sách bảo mật
                                                    </a>
                                                </FormLabel>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all"
                                    size="lg"
                                >
                                    {isSubmitting ? (
                                        "Đang gửi..."
                                    ) : (
                                        <>
                                            Gửi đăng ký
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-center text-sm text-gray-500">
                                    Chúng tôi sẽ liên hệ với bạn trong vòng 2-3 ngày làm việc
                                </p>
                            </form>
                        </Form>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-white">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
                        Câu hỏi thường gặp
                    </h2>

                    <div className="space-y-6">
                        {[
                            {
                                q: "Chi phí để trở thành Host là bao nhiêu?",
                                a: "Hoàn toàn miễn phí! Chúng tôi chỉ thu 15% phí dịch vụ từ mỗi đặt chỗ thành công.",
                            },
                            {
                                q: "Tôi cần chuẩn bị gì cho khu đất?",
                                a: "Khu đất cần có diện tích tối thiểu 100m², tiện nghi cơ bản như nước sạch, toilet. Chúng tôi sẽ hỗ trợ bạn cải thiện các tiện nghi khác.",
                            },
                            {
                                q: "Làm sao để đảm bảo an toàn?",
                                a: "Tất cả khách hàng đều được xác minh danh tính. Chúng tôi cung cấp bảo hiểm trách nhiệm và hỗ trợ 24/7.",
                            },
                            {
                                q: "Khi nào tôi nhận được tiền?",
                                a: "Thanh toán được chuyển khoản tự động sau mỗi đặt chỗ hoàn tất, thường trong vòng 2-3 ngày làm việc.",
                            },
                        ].map((faq, index) => (
                            <details
                                key={index}
                                className="group bg-gray-50 rounded-xl p-6 hover:bg-emerald-50 transition-colors"
                            >
                                <summary className="flex cursor-pointer items-center justify-between font-semibold text-lg text-gray-900">
                                    {faq.q}
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 group-open:rotate-180 transition-transform" />
                                </summary>
                                <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 py-20">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6">
                        Sẵn sàng bắt đầu?
                    </h2>
                    <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                        Tham gia cùng hàng nghìn chủ đất đang kiếm thu nhập từ đất trống của họ
                    </p>
                    <Button
                        size="lg"
                        className="bg-white text-emerald-700 hover:bg-emerald-50 h-14 px-8 text-lg font-semibold shadow-xl"
                        onClick={() => {
                            document.getElementById("registration-form")?.scrollIntoView({
                                behavior: "smooth",
                            });
                        }}
                    >
                        Đăng ký ngay
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </section>
        </div>
    );
}