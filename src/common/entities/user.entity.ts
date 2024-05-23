import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  active: boolean;

  @Column()
  is_delete: boolean;

  @Column()
  created_at: string;

  @Column()
  updated_at: string;

  @Column()
  created_by: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column()
  password: string;

  @Column()
  is_spam: boolean;

  @Column()
  refresh_token: string;

  @ManyToOne(() => Users, (users) => users.user)
  @JoinColumn([{ name: 'created_by' }])
  users: Users;

  @OneToMany(() => Users, (user) => user.users)
  user: Users[];
}
