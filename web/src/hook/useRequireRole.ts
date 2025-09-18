// hooks/useRequireRole.ts
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const useRequireRole = (requiredRole: "admin" | "user") => {
  const router = useRouter();
  const role = useSelector((state: RootState) => state.auth.role);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!role) {
      router.push("/login"); // chưa có role thì về login
      return;
    }

    if (role !== requiredRole) {
      router.push("/home"); // sai role thì về home
      return;
    }

    setIsChecking(false); // đúng role thì cho phép render
  }, [role, requiredRole, router]);

  return { isChecking };
};
