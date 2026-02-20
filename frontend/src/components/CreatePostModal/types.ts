export interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onPostCreated: () => void;
}
