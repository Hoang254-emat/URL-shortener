import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule và ConfigService
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlModule } from './url/url.module'; // Sẽ tạo sau
import { Url } from './url/entities/url.entity'; // Sẽ tạo sau
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'; // <-- THÊM DÒNG NÀY

@Module({
  imports: [
    ConfigModule.forRoot({ // Cấu hình ConfigModule
      isGlobal: true, // Biến môi trường có sẵn toàn cục
      envFilePath: '.env', // Đường dẫn đến file .env
    }),
    TypeOrmModule.forRootAsync({ // Cấu hình TypeOrmModule bất đồng bộ
      imports: [ConfigModule], // Import ConfigModule để sử dụng ConfigService
      useFactory: (configService: ConfigService) => {
        const dbConfig: PostgresConnectionOptions = { // <-- ÉP KIỂU SANG PostgresConnectionOptions
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          entities: [Url], // Thêm entity Url vào đây
          synchronize: false, // Rất quan trọng: Đặt là false trên môi trường production
                            // Vì chúng ta đã tạo bảng thủ công.
                            // Nếu đặt true, TypeORM có thể thay đổi/xóa bảng hiện có.
          logging: true, // Bật logging để xem các câu lệnh SQL
        };
        console.log('Database Configuration:', dbConfig); // <-- THÊM DÒNG NÀY ĐỂ DEBUG
        return dbConfig;
      },
      inject: [ConfigService], // Inject ConfigService vào useFactory
    }),
    UrlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}