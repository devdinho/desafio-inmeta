import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

import { Employee } from './entities/employee.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const employee = this.employeeRepository.create({
      name: createEmployeeDto.name,
      hiredAt: createEmployeeDto.hiredAt,
    });

    return await this.employeeRepository.save(employee);
  }

  findAll(): Promise<Employee[]> {
    return this.employeeRepository.find();
  }

  async findOne(id: number): Promise<Employee | null> {
    return this.employeeRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.employeeRepository.findOneBy({ id });
    if (!employee) throw new NotFoundException('Employee not found');
    employee.name = updateEmployeeDto.name ?? employee.name;
    employee.hiredAt = updateEmployeeDto.hiredAt ?? employee.hiredAt;
    return this.employeeRepository.save(employee);
  }

  async remove(id: number): Promise<DeleteResult> {
    const employee = await this.employeeRepository.findOneBy({ id });
    if (!employee) throw new NotFoundException('Employee not found');
    employee.id = id;

    const user_id = employee.userId;

    if (user_id) {
      await this.userRepository.delete({ id: user_id });
    }

    return await this.employeeRepository.delete(employee.id);
  }
}
