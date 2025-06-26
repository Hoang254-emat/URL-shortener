import { Controller, Post, Body } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { InjectModel } from '@nestjs/sequelize';
import { Link } from './link.model';

@Controller('api')
export class AppController {
  constructor(
    @InjectModel(Link)
    private readonly linkModel: typeof Link,
  ) {}

  @Post('/shorten')
  async shorten(@Body('original_url') original_url: string) {
    if (!/^https?:\/\//i.test(original_url)) {
      original_url = 'https://' + original_url;
    }

    if (!original_url) {
      return { error: 'Missing URL' };
    }

    let link = await this.linkModel.findOne({ where: { original_url } });

    if (!link) {
      let short_url: string;
      do {
        short_url = Math.random().toString(36).substring(2, 8);
      } while (await this.linkModel.findOne({ where: { short_url } }));

      const newLink = this.linkModel.build({ original_url, short_url });
      link = await newLink.save();

    }

    const qr = await QRCode.toDataURL(`https://s.toolhub.app:4343/${link.short_url}`);
    return { short_url: link.short_url, qr };
  }
}
