import React from 'react';
import { Post as PostType } from '../../types/post';
import { formatTimeAgo } from '../../utils/dateUtils';
import './Post.scss'; // Assuming you might extracting some post specific styles here

interface PostProps {
    post: PostType;
    currentUserAvatar?: string;
    love: boolean;
    onLoveClick: () => void;
    lastPostElementRef?: (node: HTMLDivElement) => void;
}

const Post: React.FC<PostProps> = ({
    post,
    currentUserAvatar,
    love,
    onLoveClick,
    lastPostElementRef
}) => {

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
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p className="ownerName" style={{ margin: 0 }}>{post.user?.fullname}</p>
                        <span style={{ fontSize: '0.8rem', color: '#777', marginLeft: '10px' }}>
                            {post.createdAt ? formatTimeAgo(post.createdAt) : ''}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#777', marginLeft: '10px' }}>
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
                <i
                    className={`fa-heart love_icon ${love === true ? 'fa-solid is_loved' : 'fa-regular'}`}
                    onClick={onLoveClick}
                >
                </i>
                <i className="fa-regular fa-comment comment_icon"></i>
            </div>

            <div className="break"></div>

            <div className="writeComment">
                <img src={currentUserAvatar} alt="avatar" className="avaUser" />
                <input type="text" placeholder="Write your comment..." className="inputComment" />
                <i className="fa-regular fa-paper-plane sendButton"></i>
            </div>
        </div>
    );
};

export default Post;
