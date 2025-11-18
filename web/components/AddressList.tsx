import { Edit2, Trash2, CheckCircle } from "lucide-react";

type Address = {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district?: string;
  isDefault?: boolean;
};

type AddressListProps = {
  addresses: Address[];
  selectedAddressIndex: number | null;
  setSelectedAddressIndex: (idx: number) => void;
  handleRemoveAddress: (idx: number) => void;
  setShowModal: (open: boolean) => void;
  addrError?: string | null;
};

export default function AddressList({
  addresses,
  selectedAddressIndex,
  setSelectedAddressIndex,
  handleRemoveAddress,
  setShowModal,
  addrError,
}: AddressListProps) {
  return (
    <div className="space-y-4">
      {addrError && (
        <div className="text-sm text-red-600 mb-2">{addrError}</div>
      )}

      {addresses.length > 0 ? (
        addresses.map((addr, idx) => (
          <div
            key={idx}
            className={`relative flex items-start justify-between p-5 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
              selectedAddressIndex === idx
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Radio + nội dung */}
            <label className="flex items-start gap-3 flex-1 cursor-pointer">
              <input
                type="radio"
                name="address"
                checked={selectedAddressIndex === idx}
                onChange={() => setSelectedAddressIndex(idx)}
                className="mt-1 accent-blue-600"
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className=" text-gray-900 text-base">
                    Tên người nhận : {addr.fullName} 
                  </span>
                 


                  {addr.isDefault && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={12} />
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                    Số điện thoại : {addr.phone} 
                </div>
                <div className="text-sm text-gray-600">
                    Địa chỉ nhận hàng : {addr.addressLine}, {addr.district } , Tỉnh {addr.city}
                </div>
              </div>
            </label>

            {/* Nút hành động (icon) */}
            <div className="flex items-center gap-3 ml-4 text-gray-500">
              <button
                className="p-2 rounded-lg cursor-pointer hover:bg-green-50 hover:text-green-600 transition"
                title="Chỉnh sửa địa chỉ"
                disabled
              >
                <Edit2 color="green" size={18} className="opacity-70" />
              </button>
              <button
                onClick={() => handleRemoveAddress(idx)}
                className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition"
                title="Xóa địa chỉ"
              >
                <Trash2 color="red" size={18} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-sm italic">
          Bạn chưa có địa chỉ nhận hàng.
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 font-medium shadow-sm"
        >
          + Thêm địa chỉ mới
        </button>
      
      </div>
    </div>
  );
}