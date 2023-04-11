import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  dataUpdate: Date;
}
