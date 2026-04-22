export interface Message {
    _id?: string;
    user1: string;
    user2: string;
    content: string;
    sentAt?: string;
    isRead?: boolean;
    readAt?: string | null;
}