import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    private configService: ConfigService, 
  ) {}

  private generateShortCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 7; 
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  async shortenUrl(longUrl: string) {
    if (!longUrl || longUrl.trim() === '') {
      throw new BadRequestException('URL dài không được để trống.');
    }

    // Kiểm tra xem longUrl đã tồn tại chưa
    let existingUrl = await this.urlRepository.findOne({ where: { long_url: longUrl } });

    if (existingUrl) {
      const shortUrl = `${this.configService.get<string>('BASE_URL')}/${existingUrl.short_code}`;
      const qrCodeDataUrl = await QRCode.toDataURL(shortUrl);
      return {
        shortUrl,
        qrCode: qrCodeDataUrl,
        clicks: existingUrl.clicks,
        isNew: false, 
      };
    }

    // Nếu chưa tồn tại, tạo short_code mới
    let shortCode: string = ''; 
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

    const shortUrl = `${this.configService.get<string>('BASE_URL')}/${newUrl.short_code}`;
    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl);

    return {
      shortUrl,
      qrCode: qrCodeDataUrl,
      clicks: newUrl.clicks,
      isNew: true, 
    };
  }

  async redirectToLongUrl(shortCode: string): Promise<string> {
    console.log(`[Redirect] Received request for short code: ${shortCode}`); 
    const urlEntry = await this.urlRepository.findOne({ where: { short_code: shortCode } });

    if (!urlEntry) {
      console.log(`[Redirect] Short code not found in DB: ${shortCode}`); 
      throw new NotFoundException('Mã rút gọn không tồn tại.');
    }

    // Tăng số lượt click
    urlEntry.clicks++;
    await this.urlRepository.save(urlEntry);

    console.log(`[Redirect] Found long URL: ${urlEntry.long_url} for short code: ${shortCode}`); 
    return urlEntry.long_url;
  }

  async getUrlInfo(shortCode: string) {
    const urlEntry = await this.urlRepository.findOne({ where: { short_code: shortCode } });

    if (!urlEntry) {
      throw new NotFoundException('Mã rút gọn không tồn tại.');
    }
    const shortUrl = `${this.configService.get<string>('BASE_URL')}/${urlEntry.short_code}`;
    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl);
    return {
      longUrl: urlEntry.long_url,
      shortUrl,
      qrCode: qrCodeDataUrl,
      clicks: urlEntry.clicks,
    };
  }
}
