import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Post as PostType } from '../../types/post';
import Post from '../../components/Post/Post';
import { useAuth } from '../../contexts/AuthContext';
import './PostDetailPage.scss';

const PostDetailPage: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState<PostType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!postId) return;

        setIsLoading(true);
        setError(null);

        api.get<{ message: string; post: PostType }>(`/api/posts/detail/${postId}`)
            .then((res) => {
                setPost(res.data.post);
            })
            .catch((err) => {
                console.error('Failed to fetch post detail:', err);
                setError('Bài viết không tồn tại hoặc đã bị xóa.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [postId]);

    return (
        <div className="postDetailPage">
            <div className="postDetailContainer">
                <button className="backBtn" onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-arrow-left"></i> Quay lại
                </button>

                {isLoading && (
                    <div className="postLoadingState">
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                        <p>Đang tải bài viết...</p>
                    </div>
                )}

                {error && (
                    <div className="postErrorState">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <p>{error}</p>
                        <button className="homeBtn" onClick={() => navigate('/')}>
                            Trở về Trang chủ
                        </button>
                    </div>
                )}

                {!isLoading && !error && post && (
                    <div className="postWrapper">
                        <Post post={post} currentUserAvatar={user?.avatar} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostDetailPage;
