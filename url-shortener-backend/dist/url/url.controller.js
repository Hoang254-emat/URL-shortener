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
exports.UrlController = void 0;
const common_1 = require("@nestjs/common");
const url_service_1 = require("./url.service");
const shorten_url_dto_1 = require("./dto/shorten-url.dto");
let UrlController = class UrlController {
    urlService;
    constructor(urlService) {
        this.urlService = urlService;
    }
    async shorten(shortenUrlDto) {
        const { longUrl } = shortenUrlDto;
        return this.urlService.shortenUrl(longUrl);
    }
    async redirect(shortCode, res) {
        try {
            const longUrl = await this.urlService.redirectToLongUrl(shortCode);
            return res.redirect(common_1.HttpStatus.MOVED_PERMANENTLY, longUrl);
        }
        catch (error) {
            if (error.status === common_1.HttpStatus.NOT_FOUND) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({ message: error.message });
            }
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server nội bộ.' });
        }
    }
};
exports.UrlController = UrlController;
__decorate([
    (0, common_1.Post)('shorten'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shorten_url_dto_1.ShortenUrlDto]),
    __metadata("design:returntype", Promise)
], UrlController.prototype, "shorten", null);
__decorate([
    (0, common_1.Get)(':shortCode'),
    __param(0, (0, common_1.Param)('shortCode')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UrlController.prototype, "redirect", null);
exports.UrlController = UrlController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [url_service_1.UrlService])
], UrlController);
//# sourceMappingURL=url.controller.js.map