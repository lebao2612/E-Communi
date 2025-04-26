import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Post } from '../../posts/entities/post.entity'
import { Message } from '../../messages/entities/message.entity'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    avatar: string;

    @Column()
    name: string;

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];
}
