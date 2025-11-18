

/** Thông tin 1 địa chỉ */
declare interface Address {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district?: string;
  isDefault?: boolean;
}

/** Document lưu nhiều địa chỉ của 1 user */
declare interface UserAddress {
  user: string ; // userId
  addresses: Address[];
}

/* AddAddressPayload removed because it was identical to Address; use Address directly. */