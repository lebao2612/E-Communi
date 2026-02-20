import { User } from "./user";

export interface Post {
    _id: string;
    user?: User;
    image?: string;
    images?: string[];
    privacy?: string;
    content?: string;
    createdAt?: string;
}