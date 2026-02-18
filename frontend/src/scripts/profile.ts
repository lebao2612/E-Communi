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

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<string | null> => {
        const file = event.target.files?.[0];
        if (!file) return null;

        const formData = new FormData();
        formData.append('image', file);

        try {
            // 1. Upload to Cloudinary
            const uploadRes = await api.post('/api/test/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = uploadRes.data.imageUrl;
            return imageUrl;

        } catch (error) {
            console.error("Avatar upload failed:", error);
            alert("Failed to upload avatar");
            return null;
        }
    };

    const handleButtonChangeProfile = () => {
        navigate('/changeprofile');
    }

    const handleSaveProfile = (fullname: string, username: string, userBio: string,) => {
        api.put('/api/users/update', {
            fullname,
            bio: userBio,
        })
            .then(response => {
                console.log("Update profile success: ", response);
                alert("Cập nhật thông tin thành công!");
                navigate(`/${username}`);
            })
            .catch(error => {
                console.log("Update profile failed: ", error);
            })
    }

    const updateUserAvatar = async (avatarUrl: string) => {
        try {
            await api.put('/api/users/update', { avatar: avatarUrl });
        } catch (error) {
            console.error("Failed to update user avatar:", error);
            alert("Failed to update avatar in profile");
        }
    }

    return {
        userLogin,
        userParam,
        userPosts,
        love,
        handleClickLove,
        handleButtonMessage,
        handleAvatarUpload,
        updateUserAvatar,
        handleButtonChangeProfile,
        handleSaveProfile,
        setUserParam,
        setUserLogin,
    }
}