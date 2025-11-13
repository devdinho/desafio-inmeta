import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmployeeModule } from './employee/employee.module';
import { UserModule } from './user/user.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env', // Specify the path to your .env file
      isGlobal: true, // Make ConfigModule available globally
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PGHOST,
      port: 5432,
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    EmployeeModule,
    UserModule,
    DocumentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
