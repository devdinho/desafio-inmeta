import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { DocumentRequestService } from '../document/document.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ResponseEmployeeDto } from './dto/response-employee.dto';

@ApiTags('Employee')
@ApiBearerAuth()
@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly documentRequestService: DocumentRequestService,
  ) {}

  @Get(':id/document-status')
  async documentStatus(@Param('id') id: string) {
    return this.documentRequestService.getEmployeeDocumentStatus(+id);
  }

  @Post()
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
  ): Promise<ResponseEmployeeDto> {
    const employee = await this.employeeService.create(createEmployeeDto);

    return plainToInstance(ResponseEmployeeDto, employee, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(): Promise<ResponseEmployeeDto[]> {
    const employees = await this.employeeService.findAll();

    return employees.map((employee) =>
      plainToInstance(ResponseEmployeeDto, employee, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseEmployeeDto> {
    const employee = await this.employeeService.findOne(+id);

    return plainToInstance(ResponseEmployeeDto, employee, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<ResponseEmployeeDto> {
    const employee = await this.employeeService.update(+id, updateEmployeeDto);
    return plainToInstance(ResponseEmployeeDto, employee, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(+id);
  }
}
