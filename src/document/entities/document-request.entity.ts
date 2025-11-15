import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ManyToOne, JoinColumn, Index } from 'typeorm';

import { Employee } from '../../employee/entities/employee.entity';
import { DocumentType } from './document-type.entity';

@Entity()
@Index(['employee', 'documentType'], { unique: true })
export class DocumentRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, (employee) => employee.documentRequests, {
    eager: true,
  })
  employee: Employee;

  @ManyToOne(
    () => DocumentType,
    (documentType) => documentType.documentRequests,
    { eager: true },
  )
  documentType: DocumentType;

  @Column({ type: 'boolean', default: false })
  approved: boolean;

  @ManyToOne(
    () => Employee,
    (approvedBy) => approvedBy.approvedDocumentRequests,
    { eager: true },
  )
  @JoinColumn()
  approvedBy: Employee;

  @ManyToOne(() => Employee, { eager: true, nullable: true })
  @JoinColumn()
  uploadedBy: Employee;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  uploadedAt: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
