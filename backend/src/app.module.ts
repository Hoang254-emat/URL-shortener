import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Link } from './link.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('DB_HOST:', config.get('DB_HOST')); // ✅ Test xem có đọc được không

        return {
          dialect: 'postgres',
          host: config.getOrThrow('DB_HOST'),
          port: +(config.get<number>('DB_PORT') || 5432),
          username: config.getOrThrow('DB_USER'),
          password: config.getOrThrow('DB_PASS'),
          database: config.getOrThrow('DB_NAME'),
          models: [Link],
          autoLoadModels: true,
          synchronize: true,
          logging: console.log,
        };
      },
    }),
    SequelizeModule.forFeature([Link]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
