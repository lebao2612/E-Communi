import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/user';
import { Post } from '../types/post';

export const useHomeLogic = () => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [postContent, setPostContent] = useState<string>("");

    const [love, setLove] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const { isLoggedIn, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return; // Chờ auth context hoàn tất

        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        api.get('/api/users/me')
            .then(res => {
                setUser(res.data);
                console.log('Fetched user:', res.data);
            })
            .catch(err => {
                console.error('Error fetching user:', err.response?.data);
                navigate('/login');
            });
    }, [navigate, isLoggedIn, authLoading]);

    useEffect(() => {
        if (!user) return;

        api.get('/api/users').then(res => {
            setAllUsers(res.data.filter((u: User) => u._id !== user._id));
        });

        api.get('/api/posts/getAllPosts').then(res => {
            setAllPosts(res.data.data);
        });
    }, [user]);

    const handleClickLove = () => {
        setLove(!love);
    }

    const handleProfileButtonClick = () => {
        navigate(`/${user?.username}`)
    }

    const handlePostButtonClick = () => {
        if (!postContent.trim()) return;

        api.post('/api/posts/upPost', { content: postContent })
            .then(res => {
                setAllPosts(prev => [res.data.post, ...prev]);
                setPostContent('');
            })
            .catch(err => {
                console.error('Error uploading post:', err.response?.data?.message || err.message);
                alert('Lỗi khi đăng bài: ' + (err.response?.data?.message || err.message));
            });
    };

    return {
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