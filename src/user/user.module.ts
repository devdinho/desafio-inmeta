import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [], // Endpoints de User removidos - gerenciamento via Employee
  providers: [UserService],
  exports: [UserService], // Exportar service para uso em AuthModule
})
export class UserModule {}
