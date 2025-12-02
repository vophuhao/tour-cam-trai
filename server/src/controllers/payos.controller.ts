import catchErrors from "@/errors/catch-errors";
import PayOSService from "@/services/payos.service";




export const handlePayOSWebhook = catchErrors(async (req, res) => {
    const payOSService = new PayOSService();
    const result = await payOSService.handlePayOS(req.body);
    return res.status(200).json(result);
  });

