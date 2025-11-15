import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  RelationId,
  OneToMany,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { DocumentRequest } from '../../document/entities/document-request.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((employee: Employee) => employee.user)
  userId: number;

  @Column({ type: 'date' })
  hiredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DocumentRequest, (dr) => dr.employee)
  documentRequests: DocumentRequest[];

  @OneToMany(() => DocumentRequest, (dr) => dr.approvedBy)
  approvedDocumentRequests: DocumentRequest[];
}
