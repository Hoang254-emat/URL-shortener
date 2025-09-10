import { Controller, Post, Get, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { UrlService } from './url.service';
import { Response } from 'express';
import { ShortenUrlDto } from './dto/shorten-url.dto'; 

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  async shorten(@Body() shortenUrlDto: ShortenUrlDto) {
    const { longUrl } = shortenUrlDto;
    return this.urlService.shortenUrl(longUrl);
  }

  @Get(':shortCode')
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    try {
      const longUrl = await this.urlService.redirectToLongUrl(shortCode);
      return res.redirect(HttpStatus.MOVED_PERMANENTLY, longUrl);
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server nội bộ.' });
    }
  }
}