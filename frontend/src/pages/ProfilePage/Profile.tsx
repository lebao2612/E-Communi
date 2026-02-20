import './profile.scss'
import { useProfileLogic } from '../../scripts/profile';
import Post from '../../components/Post/Post';

const Profile = () => {

    const {
        userLogin,
        userParam,
        userPosts,
        love,
        handleClickLove,
        handleButtonMessage,
        handleAvatarUpload,
        handleButtonChangeProfile,
        setUserParam,
        updateUserAvatar,
        followers,
        following,
        handleFollow,
        handleUnfollow,
    } = useProfileLogic();

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const imageUrl = await handleAvatarUpload(event);
        if (imageUrl) {
            // Update Backend
            await updateUserAvatar(imageUrl);

            // Update Local State
            setUserParam((prev: any) => prev ? { ...prev, avatar: imageUrl } : undefined);
            // Updating the context's logged-in user avatar is ideally handled via a global context update method. 
            // For now, reloading or refetching works. 
        }
    };

    console.log('userPost: ', userPosts);

    return (
        <div className='profilePage'>
            {userParam && (
                <div>
                    <div className='media-container'>
                        <img src={userParam.coverImage} alt='background' className='backgroundImg' />
                        <div className='infoGroup'>
                            <div className='avaGroup'>
                                <div className='avaPr'>
                                    <img src={userParam.avatar} alt='avatar' className='avatarUser' />
                                    {userLogin?._id === userParam._id && (
                                        <>
                                            <input
                                                type="file"
                                                id="avatar-upload"
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                            />
                                            <label htmlFor="avatar-upload">
                                                <i className="fa-solid fa-camera" style={{ cursor: 'pointer' }}></i>
                                            </label>
                                        </>
                                    )}
                                    {/* <i className="fa-solid fa-camera"></i> */}
                                </div>
                                <div className='namePr'>
                                    <p className='name'>{userParam.fullname}</p>
                                    <p className='username'>@{userParam.username}</p>
                                    <div className='followInfo'>
                                        <p className='followers'> <span className='bold'>{followers.length}</span> followers</p>
                                        <p className='following'> <span className='bold'>{following.length}</span> following</p>
                                    </div>
                                </div>
                            </div>

                            {userLogin?._id === userParam._id ?
                                (<div className='changeProfile'>
                                    <i className="fa-solid fa-pen"></i>
                                    <p className='' onClick={() => handleButtonChangeProfile()}>Chỉnh sửa profile</p>
                                </div>) :
                                (<div className='actionButtons'>
                                    <div className='messageFriend'>
                                        <i className="fa-solid fa-message"></i>
                                        <p
                                            className=''
                                            onClick={() => handleButtonMessage(userParam._id)}
                                        >
                                            Nhắn tin
                                        </p>
                                    </div>
                                    {followers.some(u => u._id === userLogin?._id) ? (
                                        <div className='unfollowBtn' onClick={handleUnfollow}>
                                            <i className="fa-solid fa-user-minus"></i>
                                            <p>Unfollow</p>
                                        </div>
                                    ) : (
                                        <div className='followBtn' onClick={handleFollow}>
                                            <i className="fa-solid fa-user-plus"></i>
                                            <p>Follow</p>
                                        </div>
                                    )}
                                </div>)
                            }
                        </div>
                    </div>
                    <div className='listPost'>
                        <div className='friendInfo'>
                            <div className='generalInfo'>
                                <h3 className=''>Giới thiệu</h3>
                                <ul className='introGroup'>
                                    {userParam.bio && (
                                        <li>
                                            <i className="fa-solid fa-info"></i>
                                            <p>{userParam.bio}</p>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className='generalInfo'>
                                <h3 className=''>Ảnh</h3>
                                <ul className='picGroup'>
                                    {
                                        userPosts.map((postPic) => (postPic.images && postPic.images.length > 0 &&
                                            <li className='eachPic' key={postPic._id}>
                                                <img src={postPic.images[0]} className='picPost' alt='picImg' />
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        </div>


                        <div className="friendPost">
                            {userPosts.length === 0 ? (
                                <div className='emptyPost'>
                                    <i className="fa-solid fa-circle-exclamation"></i>
                                    <p className='alert'>No post</p>
                                </div>
                            ) : (
                                userPosts.map((post) => (
                                    <Post
                                        key={post._id}
                                        post={post}
                                        currentUserAvatar={userLogin?.avatar}
                                        love={love}
                                        onLoveClick={handleClickLove}
                                    />
                                )))}
                        </div>
                    </div>
                </div>
            )}

        </div>

    )
}


export default Profile;