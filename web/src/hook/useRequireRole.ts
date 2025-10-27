"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { getUser } from "@/lib/api";
import { setUser } from "@/store/slices/authSlice";

export const useRequireRole = (requiredRole: "admin" | "user") => {
  const router = useRouter();
  const dispatch = useDispatch();
  const role = useSelector((state: RootState) => state.auth.role);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await getUser(); // gọi server
        const userRole = res.data.role;
        if (!userRole || userRole !== requiredRole) {
          router.push("/home"); // role sai
          return;
        }
        dispatch(setUser(res.data)); // lưu tạm
        setIsChecking(false);
      } catch {
        router.push("/login"); // token hết hạn hoặc không hợp lệ
      }
    };

    if (!role) checkRole();
    else if (role !== requiredRole) router.push("/home");
    else setIsChecking(false);
  }, [role, requiredRole, router, dispatch]);

  return { isChecking };
};
