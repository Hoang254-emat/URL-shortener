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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const QRCode = require("qrcode");
const sequelize_1 = require("@nestjs/sequelize");
const link_model_1 = require("./link.model");
let AppController = class AppController {
    linkModel;
    constructor(linkModel) {
        this.linkModel = linkModel;
    }
    async shorten(original_url) {
        if (!/^https?:\/\//i.test(original_url)) {
            original_url = 'https://' + original_url;
        }
        if (!original_url) {
            return { error: 'Missing URL' };
        }
        let link = await this.linkModel.findOne({ where: { original_url } });
        if (!link) {
            let short_url;
            do {
                short_url = Math.random().toString(36).substring(2, 8);
            } while (await this.linkModel.findOne({ where: { short_url } }));
            const newLink = this.linkModel.build({ original_url, short_url });
            link = await newLink.save();
        }
        const qr = await QRCode.toDataURL(`https://s.toolhub.app:4343/${link.short_url}`);
        return { short_url: link.short_url, qr };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Post)('/shorten'),
    __param(0, (0, common_1.Body)('original_url')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "shorten", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)('api'),
    __param(0, (0, sequelize_1.InjectModel)(link_model_1.Link)),
    __metadata("design:paramtypes", [Object])
], AppController);
//# sourceMappingURL=app.controller.js.map