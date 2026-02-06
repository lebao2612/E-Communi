import './profile.scss'
import { useProfileLogic } from '../../scripts/profile';

const Profile = () => {

    const {
        userLogin,
        userParam,
        userPosts,
        love,
        handleClickLove,
        handleButtonMessage,
    } = useProfileLogic();

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
                                    <i className="fa-solid fa-camera"></i>
                                </div>
                                <div className='namePr'>
                                    <p className='name'>{userParam.fullname}</p>
                                    <p className='username'>@{userParam.username}</p>
                                </div>
                            </div>

                            {userLogin?._id === userParam._id ?
                                (<div className='changeProfile'>
                                    <i className="fa-solid fa-pen"></i>
                                    <p className=''>Chỉnh sửa profile</p>
                                </div>) :
                                (<div className='messageFriend'>
                                    <i className="fa-solid fa-message"></i>
                                    <p
                                        className=''
                                        onClick={() => handleButtonMessage(userParam._id)}
                                    >
                                        Nhắn tin
                                    </p>
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
                                        userPosts.map((postPic) => (postPic.image &&
                                            <li className='eachPic' key={postPic._id}>
                                                <img src={postPic.image} className='picPost' alt='picImg' />
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
                                    <div className='eachPost' key={post._id}>
                                        <div className="ownerPost">
                                            <img src={userParam.avatar} alt="ownerAva" className="ownerAva" />
                                            <div className="ownerInfo">
                                                <p className="ownerTag">@{userParam.username}</p>
                                                <p className="ownerName">{userParam.fullname}</p>
                                            </div>
                                        </div>
                                        <div className="contentPost">
                                            <p className="des_content"> {post.content} </p>
                                            {post.image && <img src={post.image} alt="myloveCouple" className="img_content" />}
                                        </div>


                                        <div className="interactPost">
                                            {/* fa-solid se la cai de lam nhan nut love */}
                                            <i
                                                className={`fa-heart love_icon ${love === true ? 'fa-solid is_loved' : 'fa-regular'}`}
                                                onClick={handleClickLove}
                                            >
                                            </i>
                                            <i className="fa-regular fa-comment comment_icon"></i>
                                        </div>
                                        <div className="break"></div>
                                        <div className="writeComment">
                                            <img src={userLogin?.avatar} alt="avatar" className="avaUser" />
                                            <input type="text" placeholder="Write your comment..." className="inputComment" />
                                            <i className="fa-regular fa-paper-plane sendButton"></i>
                                        </div>
                                    </div>
                                )))}
                        </div>
                    </div>
                </div>
            )}

        </div>

    )
}


export default Profile;