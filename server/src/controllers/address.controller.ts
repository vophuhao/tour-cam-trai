import { catchErrors } from "@/errors";
import { ResponseUtil } from "@/utils";
import type AddressService from "@/services/address.service";
import { Address } from "@/models/address.model";

export default class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /** @route GET /addresses */
  getAddresses = catchErrors(async (req, res) => {
    const userId = req.userId;
    const addresses = await this.addressService.getAddresses(userId.toString());
    return ResponseUtil.success(res, addresses, "Lấy danh sách địa chỉ thành công");
  });

  /** @route POST /addresses */
  addAddress = catchErrors(async (req, res) => {
    const userId = req.userId;
    const data = req.body as Address;
    const updated = await this.addressService.addAddress(userId.toString(), data);
    return ResponseUtil.success(res, updated.addresses, "Thêm địa chỉ thành công");
  });

  /** @route DELETE /addresses/:index */
  removeAddress = catchErrors(async (req, res) => {
    const userId = req.userId;
    const index = parseInt(req.params.index as string, 10);
    const updated = await this.addressService.removeAddress(userId.toString(), index);
    return ResponseUtil.success(res, updated.addresses, "Xóa địa chỉ thành công");
  });

  /** @route PATCH /addresses/:index/default */
  setDefault = catchErrors(async (req, res) => {
    const userId = req.userId;
    const index = parseInt(req.params.index as string, 10);
    const updated = await this.addressService.setDefaultAddress(userId.toString(), index);
    return ResponseUtil.success(res, updated.addresses, "Đặt địa chỉ mặc định thành công");
  });
}
