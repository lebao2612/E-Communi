import { useState, useEffect } from "react"
import axios from "axios";
import images from "../assets/images";

interface User{
    id: number;
    username: string;
    name: string;
    avatar: string | null;
    background: string | null;
}

export const useHomeLogic = () =>{

    const [allUsers, setAllUsers] = useState<User[]>([]);

    useEffect(() => {
        axios.get("http://localhost:3001/users")
             .then(response => {
                setAllUsers(response.data);
             })
             .catch(error => {
                console.error("Error: ", error);
             });
    });

    const user = {
        name: "Le Bao",
        username: "mattob2612",
        ava: images.avatar,
    }

    const [love,setLove] =useState(false);

    const handleClickLove = () =>{
        setLove(!love);
    }

    return{
        allUsers,
        user,
        love,
        handleClickLove
    }
}