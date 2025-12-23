import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import api from '../api/axios';

interface User{
    _id: string;
    fullname?: string;
    username: string;
    email?: string;
    createdAt?: string;
    avatar ?: string;
}

interface Post{
    _id: string;
    user?: User;
    image?: string;
    content?: string;
    createdAt?: string;
}

export const useHomeLogic = () => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [postContent, setPostContent] = useState<string>("");
    
    const [love,setLove] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/users/me')
        .then(res => setUser(res.data))
        .catch(() => navigate('/login'));
    }, []);

    useEffect(() => {
    if (!user) return;

    api.get('/api/users').then(res => {
        setAllUsers(res.data.filter((u: User) => u._id !== user._id));
        });

        api.get('/api/posts/getAllPosts').then(res => {
        setAllPosts(res.data.data);
        });
    }, [user]);

    const handleClickLove = () =>{
        setLove(!love);
    }

    const handleProfileButtonClick = () =>{
        navigate(`/${user?.username}`)
    }

    const handlePostButtonClick = () => {
        if (!postContent.trim()) return;

        api.post('/api/posts/upPost', { content: postContent })
        .then(res => {
            setAllPosts(prev => [res.data.post, ...prev]);
            setPostContent('');
        });
    };

    return{
        allUsers,
        allPosts,
        user,
        love,
        postContent,
        setPostContent,
        handlePostButtonClick,
        handleClickLove,
        handleProfileButtonClick,
    }
}