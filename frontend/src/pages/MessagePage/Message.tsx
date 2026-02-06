import images from '../../assets/images';
import './message.scss'
import { useMessageLogic } from '../../scripts/message'



const Message = () => {
    const {
        currentUser,
        messages,
        inputText,
        setInputText,
        userChoosen,
        handleChooseFriend,
        handleSendMessage,
        handleSearchFriend,
        handleAvaClick,
        friendSearch,
        filterFriends,
        chatEndRef
    } = useMessageLogic();

    console.log(messages)


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
                        <input type="text" className='searchMess' placeholder='Search Messages' onChange={handleSearchFriend} value={friendSearch} />
                        <i className="fa-solid fa-sliders"></i>
                    </div>
                </div>

                <div className='listFriendMessage'>
                    {filterFriends.map((friend) =>
                        <div
                            className={`friendMessage ${userChoosen?._id === friend._id ? 'choosenFriend' : ''}`}
                            key={friend._id}
                            onClick={() => handleChooseFriend(friend)}>

                            <div className='friendInfo'>
                                <img src={friend.avatar || images.avaFriend} className='friend_ava' alt='FriendAva' />
                                <p className='friendName'>{friend.fullname}</p>
                            </div>

                            <i className="fa-solid fa-camera"></i>

                        </div>
                    )}
                </div>
            </div>

            {userChoosen && (
                <div className='messageContent'>

                    <div className='headerMessage'>

                        <div className='friendInfo' onClick={() => handleAvaClick(userChoosen)}>
                            <img src={userChoosen.avatar || images.avaFriend} alt='avaFriend' className='avaFriend' />
                            <p className='nameFriend'>{userChoosen.fullname}</p>
                        </div>

                        <div className='actions'>
                            <i className="fa-solid fa-phone"></i>
                            <i className="fa-solid fa-video"></i>
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                        </div>
                    </div>

                    <div className='chatMessgae'>
                        {messages.map((message) => (
                            message.user1 === currentUser?._id ? (
                                <p className='meSend' key={message._id}>
                                    {message.content}
                                </p>
                            ) : (
                                <div className='friendSend' key={message._id}>
                                    <img src={userChoosen.avatar || images.avaFriend} alt='avaFriend' className='avaMess' />
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
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                        />
                        <i
                            className="fa-solid fa-paper-plane sendMessage"
                            onClick={handleSendMessage}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Message;