import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useFeedStore } from '../stores/feedStore';
import { useUIStore } from '../stores/uiStore';

export const useHomeLogic = () => {
    const [postContent, setPostContent] = useState<string>("");

    const navigate = useNavigate();
    const { isLoggedIn, loading: authLoading, user } = useAuth();

    const allUsers = useFeedStore((state) => state.allUsers);
    const allPosts = useFeedStore((state) => state.allPosts);
    const hasMore = useFeedStore((state) => state.hasMore);
    const isLoadingPosts = useFeedStore((state) => state.isLoadingPosts);
    const fetchSuggestedUsers = useFeedStore((state) => state.fetchSuggestedUsers);
    const fetchNextPage = useFeedStore((state) => state.fetchNextPage);
    const refreshFeed = useFeedStore((state) => state.refreshFeed);

    const isModalOpen = useUIStore((state) => state.isCreatePostModalOpen);
    const setIsModalOpen = useUIStore((state) => state.setCreatePostModalOpen);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
    }, [navigate, isLoggedIn, authLoading]);

    // Fetch Suggested Users (Contacts)
    useEffect(() => {
        if (!user) return;
        void fetchSuggestedUsers(user._id);
    }, [user, fetchSuggestedUsers]);

    // Fetch Posts (Infinite Scroll)
    const fetchPosts = useCallback(async () => {
        await fetchNextPage();
    }, [fetchNextPage]);

    // Initial Load of Posts
    useEffect(() => {
        if (user) {
            if (allPosts.length === 0 && hasMore) {
                void fetchPosts();
            }
        }
    }, [user, fetchPosts, hasMore, allPosts]);


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


    const handleProfileButtonClick = () => {
        navigate(`/${user?.username}`)
    }

    const handlePostButtonClick = () => {
        setIsModalOpen(true);
    };

    const handlePostCreated = () => {
        void refreshFeed();
    }


    return {
        allUsers,
        allPosts,
        user,
        postContent,
        setPostContent,
        handlePostButtonClick,
        handleProfileButtonClick,
        isModalOpen,
        setIsModalOpen,
        handlePostCreated,
        lastPostElementRef,
        isLoadingPosts
    }
}