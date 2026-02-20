import { useState, useEffect, useCallback, useRef } from "react"
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

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (authLoading) return;

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

    // Fetch Suggested Users (Contacts)
    useEffect(() => {
        if (!user) return;
        api.get('/api/users/getAllUsers').then(res => {
            // Filter out current user
            if (res.data.users) {
                setAllUsers(res.data.users.filter((u: User) => u._id !== user._id));
            } else if (Array.isArray(res.data)) {
                setAllUsers(res.data.filter((u: User) => u._id !== user._id));
            }
        });
    }, [user]);

    // Fetch Posts (Infinite Scroll)
    const fetchPosts = useCallback(async () => {
        if (isLoadingPosts || !hasMore) return;
        setIsLoadingPosts(true);
        try {
            const res = await api.get(`/api/posts/getNewsFeed?page=${page}&limit=10`);
            const newPosts = res.data.data;

            setAllPosts(prev => {
                // Avoid duplicates just in case
                const existingIds = new Set(prev.map(p => p._id));
                const uniqueNewPosts = newPosts.filter((p: any) => !existingIds.has(p._id));
                return [...prev, ...uniqueNewPosts];
            });

            if (newPosts.length < 10) {
                setHasMore(false);
            } else {
                setPage(prev => prev + 1);
            }
        } catch (err) {
            console.error("Error fetching news feed:", err);
        } finally {
            setIsLoadingPosts(false);
        }
    }, [page, isLoadingPosts, hasMore]);

    // Initial Load of Posts
    useEffect(() => {
        if (user) {
            if (allPosts.length === 0 && hasMore) {
                fetchPosts();
            }
        }
    }, [user]);


    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoadingPosts) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchPosts();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoadingPosts, hasMore, fetchPosts]);


    const handleClickLove = () => {
        setLove(!love);
    }

    const handleProfileButtonClick = () => {
        navigate(`/${user?.username}`)
    }

    const handlePostButtonClick = () => {
        setIsModalOpen(true);
    };

    const handlePostCreated = () => {
        setPage(1);
        setAllPosts([]);
        setHasMore(true);

        setIsLoadingPosts(true);
        api.get(`/api/posts/getNewsFeed?page=1&limit=10`)
            .then(res => {
                setAllPosts(res.data.data);
                if (res.data.data.length < 10) setHasMore(false);
                else {
                    setHasMore(true);
                    setPage(2);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoadingPosts(false));
    }


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
        setUser,
        isModalOpen,
        setIsModalOpen,
        handlePostCreated,
        lastPostElementRef,
        isLoadingPosts
    }
}