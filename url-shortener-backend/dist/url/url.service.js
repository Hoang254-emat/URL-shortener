"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const url_entity_1 = require("./entities/url.entity");
const QRCode = require("qrcode");
const config_1 = require("@nestjs/config");
let UrlService = class UrlService {
    urlRepository;
    configService;
    constructor(urlRepository, configService) {
        this.urlRepository = urlRepository;
        this.configService = configService;
    }
    generateShortCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const length = 7;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    async shortenUrl(longUrl) {
        if (!longUrl || longUrl.trim() === '') {
            throw new common_1.BadRequestException('URL dài không được để trống.');
        }
        let existingUrl = await this.urlRepository.findOne({ where: { long_url: longUrl } });
        if (existingUrl) {
            const shortUrl = `${this.configService.get('BASE_URL')}/${existingUrl.short_code}`;
            const qrCodeDataUrl = await QRCode.toDataURL(shortUrl);
            return {
                shortUrl,
                qrCode: qrCodeDataUrl,
                clicks: existingUrl.clicks,
                isNew: false,
            };
        }
        let shortCode = '';
        let isUnique = false;
        while (!isUnique) {
            shortCode = this.generateShortCode();
            const existingShortCode = await this.urlRepository.findOne({ where: { short_code: shortCode } });
            if (!existingShortCode) {
                isUnique = true;
            }
        }
        const newUrl = this.urlRepository.create({
            long_url: longUrl,
            short_code: shortCode,
        });
        await this.urlRepository.save(newUrl);
        const shortUrl = `${this.configService.get('BASE_URL')}/${newUrl.short_code}`;
        const qrCodeDataUrl = await QRCode.toDataURL(shortUrl);
        return {
            shortUrl,
            qrCode: qrCodeDataUrl,
            clicks: newUrl.clicks,
            isNew: true,
        };
    }
    async redirectToLongUrl(shortCode) {
        console.log(`[Redirect] Received request for short code: ${shortCode}`);
        const urlEntry = await this.urlRepository.findOne({ where: { short_code: shortCode } });
        if (!urlEntry) {
            console.log(`[Redirect] Short code not found in DB: ${shortCode}`);
            throw new common_1.NotFoundException('Mã rút gọn không tồn tại.');
        }
        urlEntry.clicks++;
        await this.urlRepository.save(urlEntry);
        console.log(`[Redirect] Found long URL: ${urlEntry.long_url} for short code: ${shortCode}`);
        return urlEntry.long_url;
    }
    async getUrlInfo(shortCode) {
        const urlEntry = await this.urlRepository.findOne({ where: { short_code: shortCode } });
        if (!urlEntry) {
            throw new common_1.NotFoundException('Mã rút gọn không tồn tại.');
        }
        const shortUrl = `${this.configService.get('BASE_URL')}/${urlEntry.short_code}`;
        const qrCodeDataUrl = await QRCode.toDataURL(shortUrl);
        return {
            longUrl: urlEntry.long_url,
            shortUrl,
            qrCode: qrCodeDataUrl,
            clicks: urlEntry.clicks,
        };
    }
};
exports.UrlService = UrlService;
exports.UrlService = UrlService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(url_entity_1.Url)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], UrlService);
//# sourceMappingURL=url.service.js.map