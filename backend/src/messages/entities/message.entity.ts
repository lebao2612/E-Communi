import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn, } from 'typeorm'
import { User } from '../../users/entities/user.entity'


@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    // FK user1Id trỏ đến User.id
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user1Id' })
    user1: User;

    // FK user2Id trỏ đến User.id
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user2Id' })
    user2: User;

    @Column()
    content: string;

    // Lưu timestamp tự động
    @CreateDateColumn({ type: 'timestamp' })
    time: Date;
}
