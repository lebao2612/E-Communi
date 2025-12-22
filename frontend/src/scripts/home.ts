import { useState, useEffect } from "react"
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    user?: User;
    image?: string;
    content?: string;
    createdAt?: string;
}

export const useHomeLogic = () => {

    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [postContent, setPostContent] = useState<string>("");

    const rawUser  = localStorage.getItem('user');
    const user: User | null = rawUser ? JSON.parse(rawUser) : null;
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${process.env.BE_URL}/api/users`)
            .then(response => {
                const users: User[] = response.data;
                const filteredUsers = user ? users.filter(u => u._id !== user._id): users;
                //console.log("response.data =", response.data);
                setAllUsers(filteredUsers);
            })
            .catch(error => {
                console.error("Error: ", error);
            });
    }, []);

    useEffect(() => {
        axios.get(`${process.env.BE_URL}/api/posts/getAllPosts`)
            .then(response => {
                const posts = response.data.data;
                setAllPosts(posts);
            })
            .catch(error => {
                console.error("Error: ", error);
            });
    }, []);

    const [love,setLove] =useState(false);

    const handleClickLove = () =>{
        setLove(!love);
    }

    const handleProfileButtonClick = () =>{
        navigate(`/${user?.username}`)
    }

    const handlePostButtonClick = () =>{
        if(postContent.trim() === ""){
            return;
        }
        axios.post(`${process.env.BE_URL}/api/posts/upPost`, {
            userId: user?._id,
            content: postContent,
        })
        .then(response => {
            const newPost = response.data.post;
            setAllPosts(prev => [newPost, ...prev]);
            setPostContent("");
        })
        .catch(error => {
            console.error("Error: ", error);
        });
    }

    return{
        allUsers,
        allPosts,
        user,
        love,
        postContent,
        setPostContent,
        handlePostButtonClick,
        handleClickLove,
        handleProfileButtonClick,
    }
}