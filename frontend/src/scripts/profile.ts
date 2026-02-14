import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { User } from '../types/user';
import { Post } from '../types/post';


export const useProfileLogic = () => {

    const { username } = useParams();
    const navigate = useNavigate();

    const [userParam, setUserParam] = useState<User>();
    const [userLogin, setUserLogin] = useState<User | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);

    useEffect(() => {
        api.get('/api/users/me')
            .then(res => setUserLogin(res.data))
            .catch(() => navigate('/login'));
    }, [navigate]);

    useEffect(() => {
        api.get(`/api/users/${username}`)
            .then(response => {
                setUserParam(response.data)
            })
            .catch(error => {
                console.error("Error: ", error);
            });
    }, [username]);


    useEffect(() => {
        api.get('/api/posts/getPostById', {
            params: { user: userParam?._id }
        })
            .then(response => {
                setUserPosts(response.data.data)
            })
            .catch(error => {
                console.log("Error: ", error);
            })
    }, [userParam?._id]);

    const [love, setLove] = useState(false);

    const handleClickLove = () => {
        setLove(!love);
    }

    function handleButtonMessage(userid: string) {
        navigate(`/message/${userid}`)
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            // 1. Upload to Cloudinary
            const uploadRes = await api.post('/api/test/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = uploadRes.data.imageUrl;

            // 2. Update User Profile
            const updateRes = await api.put('/api/users/update', { avatar: imageUrl });

            console.log('updateRes: ', updateRes);

            // 3. Update Local State
            setUserParam(prev => prev ? { ...prev, avatar: imageUrl } : undefined);
            if (userLogin?._id === userParam?._id) {
                setUserLogin(prev => prev ? { ...prev, avatar: imageUrl } : null);
            }

        } catch (error) {
            console.error("Avatar upload failed:", error);
            alert("Failed to upload avatar");
        }
    };

    return {
        userLogin,
        userParam,
        userPosts,
        love,
        handleClickLove,
        handleButtonMessage,
        handleAvatarUpload,
    }
}