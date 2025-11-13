import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OneToOne, JoinColumn } from 'typeorm';

import { Employee } from '../../employee/entities/employee.entity';
import { DocumentType } from './document-type.entity';

@Entity()
export class DocumentRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Employee, { eager: true })
  @JoinColumn()
  employee: Employee;

  @OneToOne(() => DocumentType, { eager: true })
  @JoinColumn()
  documentType: DocumentType;

  @Column({ type: 'boolean', default: false })
  approved: boolean;

  @OneToOne(() => Employee, { eager: true })
  @JoinColumn()
  approvedBy: Employee;

  @Column({ type: 'date', nullable: true })
  approvedAt: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
