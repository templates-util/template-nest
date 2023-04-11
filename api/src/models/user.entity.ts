import { IsEmail, IsNotEmpty } from 'class-validator';
import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('users')
@Unique(['email'])
export class User extends BaseEntity {
  @Column({ length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ length: 255 })
  @IsNotEmpty()
  username: string;

  @Column({ unique: true, length: 255 })
  @IsEmail()
  email: string;

  @Column({ name: 'hash_password', length: 255 })
  hashPassword: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'simple-array', default: 'user' })
  perfil: string[];
}
