import { useState } from "react"
import images from "../assets/images";

export const useHomeLogic = () =>{

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
        handleClickLove
    }
}