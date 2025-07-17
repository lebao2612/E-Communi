import { useState, useEffect } from "react"
import axios from "axios";
import images from "../assets/images";

interface User{
    _id: number;
    username: string;
    fullname: string;
    avatar: string | null;
    background: string | null;
}

export const useHomeLogic = () =>{

    const [allUsers, setAllUsers] = useState<User[]>([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/users")
            .then(response => {
                //console.log("response.data =", response.data);
                setAllUsers(response.data); // ✅ chính xác
            })
            .catch(error => {
                console.error("Error: ", error);
            });
    }, []);

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