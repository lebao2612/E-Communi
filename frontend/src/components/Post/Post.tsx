import React, { useState } from 'react';
import { Post as PostType } from '../../types/post';
import { formatTimeAgo } from '../../utils/dateUtils';
import './Post.scss';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

interface PostProps {
    post: PostType;
    currentUserAvatar?: string;
    lastPostElementRef?: (node: HTMLDivElement) => void;
}

const Post: React.FC<PostProps> = ({
    post,
    currentUserAvatar,
    lastPostElementRef
}) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState<boolean>(post.likes?.includes(user?._id || '') || false);
    const [likesCount, setLikesCount] = useState<number>(post.likes?.length || 0);

    const [comments, setComments] = useState<any[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [commentInput, setCommentInput] = useState("");
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    const handleLikeClick = async () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            await api.put(`/api/posts/${post._id}/like`);
        } catch (err) {
            console.error('Failed to toggle like', err);
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleToggleComments = async () => {
        if (!showComments) {
            setIsLoadingComments(true);
            try {
                const res = await api.get(`/api/comments/post/${post._id}`);
                setComments(res.data.data);
            } catch (err) {
                console.error('Failed to fetch comments', err);
            } finally {
                setIsLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleCommentSubmit = async () => {
        if (!commentInput.trim()) return;

        try {
            const res = await api.post(`/api/comments/post/${post._id}`, { content: commentInput });
            setComments(prev => [...prev, res.data.data]);
            setCommentInput("");
        } catch (err) {
            console.error('Failed to submit comment', err);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await api.delete(`/api/comments/${commentId}`);
            setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment', err);
        }
    };

    // Logic for rendering Post Images, moved from Home.tsx
    const renderPostImages = (postImages: string[]) => {
        if (!postImages || postImages.length === 0) return null;

        if (postImages.length === 1) {
            return <img src={postImages[0]} alt="Post" className="img_content" />;
        }

        if (postImages.length === 2) {
            return (
                <div className="post-images-grid-2">
                    <img src={postImages[0]} alt="Post 1" />
                    <img src={postImages[1]} alt="Post 2" />
                </div>
            );
        }

        return (
            <div className="post-images-grid-3">
                <img src={postImages[0]} alt="Post 1" />
                <div className="side-images">
                    <img src={postImages[1]} alt="Post 2" />
                    <div className="more-images-container">
                        <img src={postImages[2]} alt="Post 3" />
                        {postImages.length > 3 && (
                            <div className="overlay">+{postImages.length - 3}</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className="friendPost"
            ref={lastPostElementRef}
        >
            <div className="ownerPost">
                <img src={post.user?.avatar} alt="ownerAva" className="ownerAva" />
                <div className="ownerInfo">
                    <p className="ownerTag">@{post.user?.username}</p>
                    <div className="ownerMeta">
                        <p className="ownerName">{post.user?.fullname}</p>
                        <span className="postDate">
                            {post.createdAt ? formatTimeAgo(post.createdAt) : ''}
                        </span>
                        <span className="privacyIcon">
                            {post.privacy === 'public' ? <i className="fa-solid fa-globe" title="Public"></i> : <i className="fa-solid fa-users" title="Followers"></i>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="contentPost">
                <p className="des_content"> {post.content} </p>
                {renderPostImages(post.images || (post.image ? [post.image] : []))}
            </div>

            <div className="interactPost">
                <div className="interact-action">
                    <i
                        className={`fa-heart love_icon ${isLiked ? 'fa-solid is_loved' : 'fa-regular'}`}
                        onClick={handleLikeClick}
                    >
                    </i>
                    <span className="interact-count">{likesCount}</span>
                </div>
                <div className="interact-action" onClick={handleToggleComments}>
                    <i className="fa-regular fa-comment comment_icon"></i>
                    <span className="interact-count">{post.comments?.length || comments.length || 0}</span>
                </div>
            </div>

            <div className="break"></div>

            {showComments && (
                <div className="commentsSection">
                    {isLoadingComments ? (
                        <p className="loadingComments">Loading comments...</p>
                    ) : (
                        comments.map(c => {
                            const isCommentAuthor = c.user?._id === user?._id;
                            const isPostOwner = post.user?._id === user?._id;
                            const canDelete = isCommentAuthor || isPostOwner;

                            return (
                                <div key={c._id} className="commentItem">
                                    <img src={c.user?.avatar} alt="ava" className="commentAva" />
                                    <div className="commentBubble">
                                        <div>
                                            <p className="commentAuthor">{c.user?.fullname}</p>
                                            <p className="commentContent">{c.content}</p>
                                        </div>
                                        {canDelete && (
                                            <div className="commentOptions">
                                                <i className="fa-solid fa-ellipsis optionIcon"></i>
                                                <div className="optionsMenu">
                                                    <button onClick={() => handleDeleteComment(c._id)}>Delete</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <div className="writeComment">
                <img src={currentUserAvatar} alt="avatar" className="avaUser" />
                <input
                    type="text"
                    placeholder="Write your comment..."
                    className="inputComment"
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') handleCommentSubmit();
                    }}
                />
                <i className="fa-regular fa-paper-plane sendButton" onClick={handleCommentSubmit}></i>
            </div>
        </div>
    );
};

export default Post;
