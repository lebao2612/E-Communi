import { User } from "./user";

export interface Comment {
    _id: string;
    content: string;
    user: User;
    postId: string;
    parentId?: string | null;
    replyTo?: User | null;
    replies?: Comment[];
    createdAt: string;
    updatedAt?: string;
}