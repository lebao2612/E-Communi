import React, { useState, useRef } from 'react';
import api from '../../api/axios';
import { CreatePostModalProps } from './types';
import './createPostModal.scss';

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, user, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [privacy, setPrivacy] = useState('public');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setImages(prev => [...prev, ...filesArray]);

            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim() && images.length === 0) return;

        setIsLoading(true);
        try {
            // 1. Upload images to Cloudinary (if any)
            let imageUrls: string[] = [];
            if (images.length > 0) {
                const uploadPromises = images.map(async (image) => {
                    const formData = new FormData();
                    formData.append('image', image);
                    const res = await api.post('/api/test/upload', formData);
                    return res.data.imageUrl;
                });
                imageUrls = await Promise.all(uploadPromises);
            }

            // 2. Create Post
            const token = localStorage.getItem('token');
            await api.post('/api/posts/upPost', {
                content,
                images: imageUrls,
                privacy
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 3. Cleanup and Close
            setContent('');
            setImages([]);
            setImagePreviews([]);
            setPrivacy('public');
            onPostCreated();
            onClose();

        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Create Post</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="user-info">
                    <img src={user?.avatar} alt="Avatar" className="avatar" />
                    <div>
                        <div className="username">{user?.fullname}</div>
                        <select
                            className="privacy-selector"
                            value={privacy}
                            onChange={(e) => {
                                setPrivacy(e.target.value);
                                console.log(e.target.value);
                            }}
                        >
                            <option value="public">Public</option>
                            <option value="followers">Followers</option>
                        </select>
                    </div>
                </div>

                <textarea
                    className="post-input"
                    placeholder={`What's on your mind, ${user?.fullname}?`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                {imagePreviews.length > 0 && (
                    <div className="image-preview-container">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="preview-item">
                                <img src={preview} alt="Preview" />
                                <button className="remove-image" onClick={() => removeImage(index)}>&times;</button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="modal-footer">
                    <div className="upload-btn">
                        <label htmlFor="image-upload">
                            <i className="fa-regular fa-image"></i>
                        </label>
                        <input
                            type="file"
                            id="image-upload"
                            multiple
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                            ref={fileInputRef}
                        />
                    </div>
                    <button
                        className="post-submit-btn"
                        onClick={handleSubmit}
                        disabled={isLoading || (!content.trim() && images.length === 0)}
                    >
                        {isLoading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
