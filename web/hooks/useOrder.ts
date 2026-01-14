import { useMutation } from "@tanstack/react-query";
import { createOrder } from "@/lib/api";

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (payload) => createOrder(payload)
  });
};