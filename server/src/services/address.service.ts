import UserAddressModel, { Address } from "@/models/address.model";

export default class AddressService {
  /** Lấy danh sách địa chỉ của user */
  async getAddresses(userId: string) {
    const userAddresses = await UserAddressModel.findOne({ user: userId });
    return userAddresses ? userAddresses.addresses : [];
  }

  /** Thêm địa chỉ mới */
  async addAddress(userId: string, address: Address) {
    let userAddresses = await UserAddressModel.findOne({ user: userId });

    if (!userAddresses) {
      // Nếu chưa có document thì tạo mới
      userAddresses = new UserAddressModel({ user: userId, addresses: [] });
    }

    return await userAddresses.addAddress(address);
  }

  /** Xóa địa chỉ theo index */
  async removeAddress(userId: string, index: number) {
    const userAddresses = await UserAddressModel.findOne({ user: userId });
    if (!userAddresses) throw new Error("Không tìm thấy địa chỉ người dùng");
    return await userAddresses.removeAddress(index);
  }

  /** Đặt địa chỉ mặc định theo index */
  async setDefaultAddress(userId: string, index: number) {
    const userAddresses = await UserAddressModel.findOne({ user: userId });
    if (!userAddresses) throw new Error("Không tìm thấy địa chỉ người dùng");
    return await userAddresses.setDefault(index);
  }
}
