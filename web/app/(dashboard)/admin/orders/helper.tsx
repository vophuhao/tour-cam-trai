export const getStatusInfo = (status: Order["orderStatus"]) => {
  switch (status) {
    case "pending":
      return { label: "Chờ xử lý", className: "bg-gray-500 text-white" };
    case "processing":
      return { label: "Đang xử lý", className: "bg-blue-500 text-white" };
    case "confirmed":
      return { label: "Đã xác nhận", className: "bg-indigo-500 text-white" };
    case "shipping":
      return { label: "Đang giao", className: "bg-orange-500 text-white" };
    case "completed":
      return { label: "Hoàn thành", className: "bg-green-600 text-white" };
    case "cancelled":
      return { label: "Đã hủy", className: "bg-red-600 text-white" };
    default:
      return { label: "Không xác định", className: "bg-gray-400 text-white" };
  }
};
