import { useEffect, useRef } from 'react';
import images from '../../assets/images';
import './message.scss'
import { useMessageLogic } from '../../scripts/message'
import { useWebRTC } from '../../hooks/useWebRTC';
import IncomingCallModal from '../../components/IncomingCallModal/IncomingCallModal';
import { usePresenceStore } from '../../stores/presenceStore';

const safePlay = (element: HTMLMediaElement | null) => {
    if (!element) return;

    const playPromise = element.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
            // Ignore autoplay rejections; user interaction will start playback later.
        });
    }
};

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
        isLoadingOlderMessages,
        hasMoreMessages,
        handleChatScroll,
        chatContainerRef,
        chatEndRef
    } = useMessageLogic();

    const {
        localStream,
        remoteStream,
        receivingCall,
        callerEnv,
        callAccepted,
        callUser,
        answerCall,
        rejectCall,
        leaveCall,
    } = useWebRTC();

    const onlineUserIds = usePresenceStore((state) => state.onlineUserIds);

    const localMediaRef = useRef<HTMLVideoElement | null>(null);
    const remoteMediaRef = useRef<HTMLVideoElement | null>(null);
    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (localMediaRef.current) {
            localMediaRef.current.srcObject = localStream;
            safePlay(localMediaRef.current);
        }
        if (localAudioRef.current) {
            localAudioRef.current.srcObject = localStream;
            safePlay(localAudioRef.current);
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteMediaRef.current) {
            remoteMediaRef.current.srcObject = remoteStream;
            safePlay(remoteMediaRef.current);
        }
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            safePlay(remoteAudioRef.current);
        }
    }, [remoteStream]);

    const isVideoCall = Boolean(
        callerEnv?.type === 'video' ||
        (localStream && localStream.getVideoTracks().length > 0) ||
        (remoteStream && remoteStream.getVideoTracks().length > 0)
    );

    return (
        <div className='messagePage'>
            <IncomingCallModal
                isVisible={Boolean(receivingCall && callerEnv && !callAccepted)}
                callerEnv={callerEnv}
                onAccept={answerCall}
                onReject={rejectCall}
            />

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
                                <div className='friendDetails'>
                                    <p className='friendName'>{friend.fullname}</p>
                                    {onlineUserIds.has(friend._id) ? (
                                        <p className='onlineStatus'>Đang hoạt động</p>
                                    ) : <p className='onlineStatus'>Không hoạt động</p>}
                                </div>
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
                            <div className='friendDetails'>
                                <p className='nameFriend'>{userChoosen.fullname}</p>
                                {onlineUserIds.has(userChoosen._id) ? (
                                    <p className='onlineStatus'>Đang hoạt động</p>
                                ) : (
                                    <p className='onlineStatus'>Không hoạt động</p>
                                )}
                            </div>
                        </div>

                        <div className='actions'>
                            <i
                                className="fa-solid fa-phone"
                                onClick={() => userChoosen && callUser(userChoosen, 'audio')}
                                title='Audio call'
                            ></i>
                            <i
                                className="fa-solid fa-video"
                                onClick={() => userChoosen && callUser(userChoosen, 'video')}
                                title='Video call'
                            ></i>
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                        </div>
                    </div>

                    {callAccepted && (
                        <div className='callBanner active'>
                            <p>Call connected</p>
                            <button className='callBtn end' onClick={leaveCall}>End call</button>
                        </div>
                    )}

                    {callAccepted && isVideoCall && (
                        <div className='videoCallPanel'>
                            <video ref={remoteMediaRef} autoPlay playsInline className='videoRemote' />
                            <video ref={localMediaRef} autoPlay playsInline muted className='videoLocal' />
                        </div>
                    )}

                    <audio ref={localAudioRef} autoPlay muted />
                    <audio ref={remoteAudioRef} autoPlay />

                    <div className='chatMessgae' ref={chatContainerRef} onScroll={handleChatScroll}>
                        {isLoadingOlderMessages && (
                            <p className='chatHistoryState'>Loading older messages...</p>
                        )}
                        {!isLoadingOlderMessages && !hasMoreMessages && messages.length > 0 && (
                            <p className='chatHistoryState'>You reached the beginning of this conversation.</p>
                        )}
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