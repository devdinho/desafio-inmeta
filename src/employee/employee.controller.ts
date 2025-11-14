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
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ResponseEmployeeDto } from './dto/response-employee.dto';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto
  ): Promise<ResponseEmployeeDto> {
    const employee = await this.employeeService.create(createEmployeeDto);

    return plainToInstance(ResponseEmployeeDto, employee, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(): Promise<ResponseEmployeeDto[]> {
    const employees = await this.employeeService.findAll();

    return employees.map(employee =>
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
  remove(@Param('id') id: string) {
    return this.employeeService.remove(+id);
  }
}
