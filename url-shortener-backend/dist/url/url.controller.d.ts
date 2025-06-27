import { UrlService } from './url.service';
import { Response } from 'express';
import { ShortenUrlDto } from './dto/shorten-url.dto';
export declare class UrlController {
    private readonly urlService;
    constructor(urlService: UrlService);
    shorten(shortenUrlDto: ShortenUrlDto): Promise<{
        shortUrl: string;
        qrCode: string;
        clicks: number;
        isNew: boolean;
    }>;
    redirect(shortCode: string, res: Response): Promise<void | Response<any, Record<string, any>>>;
}
