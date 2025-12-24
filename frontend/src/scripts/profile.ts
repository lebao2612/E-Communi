import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
    
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

    const {username} = useParams();
    const navigate = useNavigate();

    const [userParam, setUserParam] = useState<User>();
    const [userLogin, setUserLogin] = useState<User | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);

     useEffect(() => {
        api.get('/api/users/me')
            .then(res => setUserLogin(res.data))
            .catch(() => navigate('/login'));
    }, []);

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