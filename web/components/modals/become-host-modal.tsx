/* eslint-disable @typescript-eslint/no-explicit-any */
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, UserCheck, Mail, Phone, FileText } from "lucide-react";

// Validation schema
const hostFormSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(255, "Tên không được quá 255 ký tự"),
  gmail: z
    .string()
    .email("Email không hợp lệ")
    .max(255, "Email không được quá 255 ký tự"),
  phone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(20, "Số điện thoại không được quá 20 ký tự")
    .regex(/^[0-9+\-() ]+$/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "Bạn phải đồng ý với điều khoản và chính sách",
  }),
});

type HostFormValues = z.infer<typeof hostFormSchema>;

export default function HostRegistrationForm() {
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

      // Prepare data without agreeToTerms
      const { agreeToTerms, ...hostData } = data;

      const response = await fetch("/api/host/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hostData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Đăng ký thất bại");
      }

      toast.success("Đăng ký thành công!", {
        description: "Chúng tôi sẽ xem xét và liên hệ với bạn sớm nhất.",
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

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold">
          Đăng ký trở thành Host
        </CardTitle>
        <CardDescription className="text-base">
          Chia sẻ địa điểm cắm trại của bạn với cộng đồng
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Họ và tên <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nguyễn Văn A"
                      {...field}
                      disabled={isSubmitting}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    Tên đầy đủ của bạn (tối đa 255 ký tự)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="gmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@gmail.com"
                      {...field}
                      disabled={isSubmitting}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    Email để chúng tôi liên hệ với bạn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="0123456789"
                      {...field}
                      disabled={isSubmitting}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    Số điện thoại liên hệ (không bắt buộc)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms & Conditions */}
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 bg-gray-50 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      Tôi đồng ý với{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        Điều khoản dịch vụ
                      </a>{" "}
                      và{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        Chính sách bảo mật
                      </a>
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Bằng cách đăng ký, bạn đồng ý cho chúng tôi sử dụng thông
                      tin của bạn theo chính sách bảo mật.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Gửi đăng ký
                </>
              )}
            </Button>

            {/* Info */}
            <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Sau khi gửi đăng ký, chúng tôi sẽ xem
                xét hồ sơ của bạn trong vòng 2-3 ngày làm việc. Bạn sẽ nhận được
                thông báo qua email khi hồ sơ được duyệt.
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}