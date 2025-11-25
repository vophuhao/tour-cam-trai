import { CheckCircle, Edit2, Trash2 } from 'lucide-react';

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
        <div className="mb-2 text-sm text-red-600">{addrError}</div>
      )}

      {addresses.length > 0 ? (
        addresses.map((addr, idx) => (
          <div
            key={idx}
            className={`relative flex items-start justify-between rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
              selectedAddressIndex === idx
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Radio + nội dung */}
            <label className="flex flex-1 cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="address"
                checked={selectedAddressIndex === idx}
                onChange={() => setSelectedAddressIndex(idx)}
                className="mt-1 accent-blue-600"
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-base text-gray-900">
                    Tên người nhận : {addr.fullName}
                  </span>

                  {addr.isDefault && (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600">
                      <CheckCircle size={12} />
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Số điện thoại : {addr.phone}
                </div>
                <div className="text-sm text-gray-600">
                  Địa chỉ nhận hàng : {addr.addressLine}, {addr.district} , Tỉnh{' '}
                  {addr.city}
                </div>
              </div>
            </label>

            {/* Nút hành động (icon) */}
            <div className="ml-4 flex items-center gap-3 text-gray-500">
              <button
                className="cursor-pointer rounded-lg p-2 transition hover:bg-green-50 hover:text-green-600"
                title="Chỉnh sửa địa chỉ"
                disabled
              >
                <Edit2 color="green" size={18} className="opacity-70" />
              </button>
              <button
                onClick={() => handleRemoveAddress(idx)}
                className="rounded-lg p-2 transition hover:bg-red-50 hover:text-red-600"
                title="Xóa địa chỉ"
              >
                <Trash2 color="red" size={18} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-500 italic">
          Bạn chưa có địa chỉ nhận hàng.
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-sm hover:opacity-95"
        >
          + Thêm địa chỉ mới
        </button>
      </div>
    </div>
  );
}
