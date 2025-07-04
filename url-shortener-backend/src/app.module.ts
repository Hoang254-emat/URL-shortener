import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlModule } from './url/url.module'; 
import { Url } from './url/entities/url.entity'; 
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'; 

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    TypeOrmModule.forRootAsync({ 
      imports: [ConfigModule], 
      useFactory: (configService: ConfigService) => {
        const dbConfig: PostgresConnectionOptions = { 
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          entities: [Url], 
          synchronize: false,
          logging: true, 
        };
        console.log('Database Configuration:', dbConfig); // DEBUG
        return dbConfig;
      },
      inject: [ConfigService],
    }),
    UrlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}