
/** Thông tin 1 địa chỉ */
export interface Address {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district?: string;
  isDefault?: boolean;
}

/** Document lưu nhiều địa chỉ của 1 user */
export interface UserAddress {
  user: string ; // userId
  addresses: Address[];
}

/** Payload khi thêm địa chỉ mới */
export interface AddAddressPayload extends Address {}

