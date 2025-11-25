
export default class PriceQController {
    constructor(private readonly priceQService: any) {}
    createPriceQ = async (req: any, res: any) => {
        const priceQ = await this.priceQService.createPriceQ(req.body);
        return res.status(201).json({ priceQ });
    };  
    getAllPriceQs = async (req: any, res: any) => {
        const priceQs = await this.priceQService.getAllPriceQs();
        return res.status(200).json({ priceQs });
    }     
    
    
}
