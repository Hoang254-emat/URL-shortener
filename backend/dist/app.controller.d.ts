import { Link } from './link.model';
export declare class AppController {
    private readonly linkModel;
    constructor(linkModel: typeof Link);
    shorten(original_url: string): Promise<{
        error: string;
        short_url?: undefined;
        qr?: undefined;
    } | {
        short_url: string;
        qr: any;
        error?: undefined;
    }>;
}
