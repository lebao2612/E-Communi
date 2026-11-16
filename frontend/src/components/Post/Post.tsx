import React, { useState, useCallback } from 'react';
import { Post as PostType } from '../../types/post';
import { User } from '../../types/user';
import { Comment } from '../../types/comment';
import { formatTimeAgo } from '../../utils/dateUtils';
import './Post.scss';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

interface PostProps {
    post: PostType;
    currentUserAvatar?: string;
    lastPostElementRef?: (node: HTMLDivElement) => void;
}

const MAX_REPLY_DEPTH = 3;

interface CommentThreadProps {
    comments: Comment[];
    post: PostType;
    currentUser: User | null | undefined;
    currentUserAvatar?: string;
    onDeleteComment: (commentId: string) => Promise<void>;
    onAddReply: (parentComment: Comment, content: string) => Promise<void>;
        onReplyClick: (comment: Comment) => void;
    replyingTo: Comment | null | undefined;
    onCancelReply: () => void;
    depth?: number;
}

const CommentThread: React.FC<CommentThreadProps> = ({
    comments,
    post,
    currentUser,
    currentUserAvatar,
    onDeleteComment,
    onAddReply,
    onReplyClick,
    replyingTo,
    onCancelReply,
    depth = 0
}) => {
    if (depth >= MAX_REPLY_DEPTH) return null;

    return (
        <div className='comment-thread' style={{ marginLeft: depth > 0 ? (depth * 24) + 'px' : 0 }}>
            {comments.map(comment => (
                <div key={comment._id} className={depth > 0 ? 'commentItem nested' : 'commentItem'}>
                    <img src={comment.user?.avatar} alt='ava' className='commentAva' />
                    <div className='commentBubble'>
                        <div className='commentHeader'>
                            <p className='commentAuthor'>{comment.user?.fullname}</p>
                            {comment.replyTo && (
                                <span className='reply-to-label'>
                                    <i className='fa-solid fa-reply'></i>
                                    Replying to @{comment.replyTo.username}
                                </span>
                            )}
                            <span className='commentTime'>{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className='commentContent'>{comment.content}</p>
                        <div className='commentActions'>
                            <button
                                className='reply-btn'
                                onClick={() => onReplyClick(comment)}
                                disabled={depth >= MAX_REPLY_DEPTH - 1}
                            >
                                <i className='fa-solid fa-reply'></i> Reply
                            </button>
                            {(() => {
                                const isCommentAuthor = comment.user?._id === currentUser?._id;
                                const isPostOwner = post.user?._id === currentUser?._id;
                                if (isCommentAuthor || isPostOwner) {
                                    return (
                                        <div className='commentOptions'>
                                            <i className='fa-solid fa-ellipsis optionIcon'></i>
                                            <div className='optionsMenu'>
                                                <button onClick={() => onDeleteComment(comment._id)}>Delete</button>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                        {comment.replies && comment.replies.length > 0 && (
                            <CommentThread
                                comments={comment.replies}
                                post={post}
                                currentUser={currentUser}
                                currentUserAvatar={currentUserAvatar}
                                onDeleteComment={onDeleteComment}
                                onAddReply={onAddReply}
                                onReplyClick={onReplyClick}
                                replyingTo={replyingTo}
                                onCancelReply={onCancelReply}
                                depth={depth + 1}
                            />
                        )}
                        {replyingTo?._id === comment._id && (
                            <ReplyInput
                                parentComment={comment}
                                currentUserAvatar={currentUserAvatar}
                                onSubmit={onAddReply}
                                onCancel={onCancelReply}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

};
interface ReplyInputProps {
    parentComment: Comment;
    currentUserAvatar?: string;
    onSubmit: (parentComment: Comment, content: string) => Promise<void>;
    onCancel: () => void;
}

const ReplyInput: React.FC<ReplyInputProps> = ({
    parentComment,
    currentUserAvatar,
    onSubmit,
    onCancel
}) => {
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!replyContent.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onSubmit(parentComment, replyContent);
            setReplyContent('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='reply-input-container'>
            <img src={currentUserAvatar} alt='avatar' className='avaUser' />
            <div className='reply-input-wrapper'>
                <input
                    type='text'
                    placeholder={'Reply to @' + (parentComment.user?.username || '') + '...'}
                    className='inputComment reply-input'
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    autoFocus
                />
                <div className='reply-input-actions'>
                    <button className='cancel-btn' onClick={onCancel}>Cancel</button>
                    <button
                        className='sendButton reply-submit-btn'
                        onClick={handleSubmit}
                        disabled={!replyContent.trim() || isSubmitting}
                    >
                        {isSubmitting ? 'Replying...' : 'Reply'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Post: React.FC<PostProps> = ({
    post,
    currentUserAvatar,
    lastPostElementRef
}) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState<boolean>(post.likes?.includes(user?._id || '') || false);
    const [likesCount, setLikesCount] = useState<number>(post.likes?.length || 0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [commentInput, setCommentInput] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

    const handleLikeClick = async () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        try {
            await api.put('/api/posts/' + post._id + '/like');
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
                const res = await api.get('/api/comments/post/' + post._id);
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
            const res = await api.post('/api/comments/post/' + post._id, { content: commentInput });
            setComments(prev => [...prev, res.data.data]);
            setCommentInput('');
        } catch (err) {
            console.error('Failed to submit comment', err);
        }
    };

    const handleReplyClick = useCallback((comment: Comment) => {
        setReplyingTo(comment);
    }, []);

    const onCancelReply = useCallback(() => {
        setReplyingTo(null);
    }, []);

    const handleAddReply = async (parentComment: Comment, content: string) => {
        try {
            const res = await api.post('/api/comments/post/' + post._id, {
                content,
                parentId: parentComment._id
            });
            setComments(prev => updateCommentTree(prev, parentComment._id, res.data.data));
            setReplyingTo(null);
        } catch (err) {
            console.error('Failed to submit reply', err);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await api.delete('/api/comments/' + commentId);
            setComments(prev => removeCommentFromTree(prev, commentId));
        } catch (err) {
            console.error('Failed to delete comment', err);
        }
    };

    const updateCommentTree = (tree: Comment[], parentId: string, newReply: Comment): Comment[] => {
        return tree.map(comment => {
            if (comment._id === parentId) {
                return {
                    ...comment,
                    replies: [...(comment.replies || []), newReply]
                };
            }
            if (comment.replies && comment.replies.length > 0) {
                return {
                    ...comment,
                    replies: updateCommentTree(comment.replies, parentId, newReply)
                };
            }
            return comment;
        });
    };

    const removeCommentFromTree = (tree: Comment[], commentId: string): Comment[] => {
        return tree
            .filter(comment => comment._id !== commentId)
            .map(comment => {
                if (comment.replies && comment.replies.length > 0) {
                    return {
                        ...comment,
                        replies: removeCommentFromTree(comment.replies, commentId)
                    };
                }
                return comment;
            });
    };

    const renderPostImages = (postImages: string[]) => {
        if (!postImages || postImages.length === 0) return null;
        if (postImages.length === 1) {
            return <img src={postImages[0]} alt='Post' className='img_content' />;
        }
        if (postImages.length === 2) {
            return (
                <div className='post-images-grid-2'>
                    <img src={postImages[0]} alt='Post 1' />
                    <img src={postImages[1]} alt='Post 2' />
                </div>
            );
        }
        return (
            <div className='post-images-grid-3'>
                <img src={postImages[0]} alt='Post 1' />
                <div className='side-images'>
                    <img src={postImages[1]} alt='Post 2' />
                    <img src={postImages[2]} alt='Post 3' />
                </div>
            </div>
        );
    };

    return (
        <div className='post' ref={lastPostElementRef}>
            <div className='headerPost'>
                <div className='avtPost'>
                    <img src={post.user?.avatar} alt='Avatar' className='img_ava' />
                </div>
                <div className='inforPost'>
                    <div className='namePost'>
                        <p className='name'>{post.user?.fullname}</p>
                        <p className='username'>@{post.user?.username}</p>
                    </div>
                    <p className='timePost'>{formatTimeAgo(post.createdAt)}</p>
                </div>
            </div>

            <div className='contentPost'>
                <p className='des_content'> {post.content} </p>
                {renderPostImages(post.images || (post.image ? [post.image] : []))}
            </div>

            <div className='interactPost'>
                <div className='interact-action'>
                    <i
                        className={isLiked ? 'fa-heart love_icon fa-solid is_loved' : 'fa-heart love_icon fa-regular'}
                        onClick={handleLikeClick}
                    >
                    </i>
                    <span className='interact-count'>{likesCount}</span>
                </div>
                <div className='interact-action' onClick={handleToggleComments}>
                    <i className='fa-regular fa-comment comment_icon'></i>
                    <span className='interact-count'>{post.comments?.length || comments.length || 0}</span>
                </div>
            </div>

            <div className='break'></div>

            {showComments && (
                <div className='commentsSection'>
                    {isLoadingComments ? (
                        <p className='loadingComments'>Loading comments...</p>
                    ) : (
                        <CommentThread
                            comments={comments}
                            post={post}
                            currentUser={user}
                            currentUserAvatar={currentUserAvatar}
                            onDeleteComment={handleDeleteComment}
                            onAddReply={handleAddReply}
                            onReplyClick={handleReplyClick}
                            replyingTo={replyingTo}
                            onCancelReply={onCancelReply}
                        />
                    )}
                </div>
            )}

            <div className='writeComment'>
                <img src={currentUserAvatar} alt='avatar' className='avaUser' />
                <input
                    type='text'
                    placeholder='Write your comment...'
                    className='inputComment'
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') handleCommentSubmit();
                    }}
                />
                <i className='fa-regular fa-paper-plane sendButton' onClick={handleCommentSubmit}></i>
            </div>
        </div>
    );
};

export default Post;