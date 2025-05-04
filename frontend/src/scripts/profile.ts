
import images from "../assets/images";
import { useState } from "react";

export const useProfileLogic = () =>{

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
        user,
        love, 
        handleClickLove,
    }
}