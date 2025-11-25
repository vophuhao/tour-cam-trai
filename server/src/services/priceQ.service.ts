import priceQModel from "@/models/priceQ.model";


export default class PriceQService {


    async createPriceQ(data: any) {
        return priceQModel.create(data);
    }
    async getAllPriceQs() {
        return priceQModel.find();
    }
}