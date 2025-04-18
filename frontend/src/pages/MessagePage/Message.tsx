import images from '../../assets/images';
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import {Friend} from '../../types/friend'
import './message.scss'

const Message = () =>{ 

    const friendList = [
        {id: 1, name: 'Lee Hyeri', image: images.avaFriend},
        {id: 2, name: 'Seul Gi', image: images.avaFriend},
        {id: 3, name: 'Jae Ji', image: images.avaFriend},
        
        // {id: 4, name: 'Lee Hyeri', image: images.avaFriend},
        // {id: 5, name: 'Seul Gi', image: images.avaFriend},
        // {id: 6, name: 'Jae Ji', image: images.avaFriend},
        
        // {id: 7, name: 'Lee Hyeri', image: images.avaFriend},
        // {id: 8, name: 'Seul Gi', image: images.avaFriend},
        // {id: 9, name: 'Jae Ji', image: images.avaFriend},
        
        // {id: 10, name: 'Lee Hyeri', image: images.avaFriend},
        // {id: 11, name: 'Seul Gi', image: images.avaFriend},
        // {id: 12, name: 'Jae Ji', image: images.avaFriend},
    ]

    //mock data, time is Timestamp in PostgreSQL
    const [messages, setMessages] = useState([
        { id: 1, content: 'Dm cuoc doi', idSender: 1, idReceiver: 2, time: 1 },
        { id: 2, content: 'Fuck', idSender: 2, idReceiver: 1, time: 2 },
        { id: 3, content: 'Toi rat ghet ban', idSender: 1, idReceiver: 2, time: 3 },
        { id: 4, content: 'Con toi thi van luon thich ban', idSender: 2, idReceiver: 1, time: 4 },
        { id: 5, content: 'Neu co the quay lai', idSender: 1, idReceiver: 2, time: 5 },
        { id: 6, content: 'Toi van thich ban', idSender: 2, idReceiver: 1, time: 6 },
    ]);

    const [inputText, setInputText] = useState('');
    const [userChoosen, setUserChoosen] = useState(friendList[0]);

    const [friendSearch, setFriendSearch] = useState('');

    //const [userChoosen, setUserChoosen] = useState<Friend[]>([]);

    const handleChooseFriend = (friend: Friend) => {
        setUserChoosen(friend)
        console.log("Click")
    }

    const handleSendMessage = () => {
        if (inputText.trim() === '') return;
    
        const newMessage = {
            id: messages.length + 1,
            content: inputText,
            idSender: 1, // giả định người gửi là mình
            idReceiver: 2,
            time: Date.now()
        };
    
        setMessages([...messages, newMessage]);
        setInputText('');
    };

    const handleSearchFriend = (e: ChangeEvent<HTMLInputElement>) =>{
        setFriendSearch(e.target.value);
    }

    const filterFriends = friendList.filter((friend) =>
        friend.name.toLowerCase().includes(friendSearch.toLowerCase())
    )

    const chatEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className='messagePage'>
            <div className='messageList'>
                <div className='messageHeader'>
                    <div className='messageTitle'>
                        <h2 className=''>Messages</h2>
                        <i className="fa-regular fa-pen-to-square"></i>
                    </div>
                    <div className='inputSearch'>
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input type="text" className='searchMess' placeholder='Search Messages' onChange={handleSearchFriend} value={friendSearch}/>
                        <i className="fa-solid fa-sliders"></i>
                    </div>
                </div>

                <div className='listFriendMessage'>
                    {filterFriends.map((friend) =>
                        <div 
                            className={`friendMessage ${userChoosen?.id === friend.id ? 'choosenFriend' : ''}`} 
                            key={friend.id}  
                            onClick={() => handleChooseFriend(friend)}>
                                
                                <div className='friendInfo'>
                                    <img src={friend.image} className='friend_ava' alt='FriendAva'/>
                                    <p className='friendName'>{friend.name}</p>
                                </div>

                                <i className="fa-solid fa-camera"></i>
                           
                        </div>
                    )}
                </div>
            </div>

            <div className='messageContent'>
                <div className='headerMessage'>
                    <div className='friendInfo'>
                        <img src={userChoosen.image} alt='avaFriend' className='avaFriend' />
                        <p className='nameFriend'>{userChoosen.name}</p>
                    </div>
                    <div className='actions'>
                        <i className="fa-solid fa-phone"></i>
                        <i className="fa-solid fa-video"></i>
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                    </div>
                </div>

                <div className='chatMessgae'>
                    {messages.map((message) =>(
                        message.idSender === 1 ? (
                            <p className='meSend' key={message.id}>
                                {message.content}
                            </p>
                        ) : (
                            <div className='friendSend' key={message.id}>
                                <img src={images.avaFriend} alt='avaFriend' className='avaMess' />
                                <p className='youSend'> {message.content} </p>
                            </div>
                        )
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className='inputMessage'>
                    <div className='attachMessage'>
                        <i className="fa-solid fa-face-smile"></i>
                        <i className="fa-solid fa-file"></i>
                    </div>
                    <input 
                        type='text' 
                        placeholder='Aa' 
                        className='inputText'
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {if (e.key == 'Enter') handleSendMessage();}}    
                    />
                    <i 
                        className="fa-solid fa-paper-plane sendMessage" 
                        onClick={handleSendMessage}    
                    />
                </div>
            </div>
        </div>
    )
}

export default Message;