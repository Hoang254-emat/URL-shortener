import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';
import { ConfigService } from '@nestjs/config';
export declare class UrlService {
    private urlRepository;
    private configService;
    constructor(urlRepository: Repository<Url>, configService: ConfigService);
    private generateShortCode;
    shortenUrl(longUrl: string): Promise<{
        shortUrl: string;
        qrCode: string;
        clicks: number;
        isNew: boolean;
    }>;
    redirectToLongUrl(shortCode: string): Promise<string>;
    getUrlInfo(shortCode: string): Promise<{
        longUrl: string;
        shortUrl: string;
        qrCode: string;
        clicks: number;
    }>;
}
