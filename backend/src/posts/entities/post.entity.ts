import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn, } from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column({nullable: true})
    picPost: string;

    @CreateDateColumn({ type: 'timestamp' })
    time: Date;

    // FK userId trỏ đến User.id
    @ManyToOne(() => User, (user) => user.posts, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: User;
}
