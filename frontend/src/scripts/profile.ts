import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
    
interface User{
    _id: string;
    fullname?: string;
    username: string;
    email?: string;
    createdAt?: string;
    avatar ?: string;
}

interface Post{
    _id: string;
    user?: string;
    image?: string;
    content?: string;
    createdAt?: string;
}

export const useProfileLogic = () =>{
    const API_URL = process.env.REACT_APP_API_URL;

    const {username} = useParams();
    const navigate = useNavigate();

    const [userParam, setUserParam] = useState<User>();
    const rawUser = localStorage.getItem('user');
    const userLogin: User | null = rawUser ? JSON.parse(rawUser) : null;
    const [userPosts, setUserPosts] = useState<Post[]>([]);

    useEffect(() => {
            axios.get(`${API_URL}/api/users/${username}`)
                .then(response => {
                    setUserParam(response.data)
                })
                .catch(error => {
                    console.error("Error: ", error);
                });
    }, [username]);


    useEffect(() => {   
        axios.get(`${API_URL}/api/posts/getPostById`, {
            params: {user: userParam?._id}
        })
            .then(response => {
                setUserPosts(response.data.data)
            })
            .catch(error => {
                console.log("Error: ", error);
            })
    }, [userParam?._id]);

    const [love,setLove] = useState(false);
    
    const handleClickLove = () =>{
        setLove(!love);
    }

    function handleButtonMessage(userid: string) {
        navigate(`/message/${userid}`)
    }

    return{
        userLogin,
        userParam,
        userPosts,
        love, 
        handleClickLove,
        handleButtonMessage,
    }
}