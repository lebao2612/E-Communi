import "./home.scss";
import '@fortawesome/fontawesome-free/css/all.min.css';
import images from "../../assets/images/index";
import { useHomeLogic } from '../../scripts/home';
import CreatePostModal from '../../components/CreatePostModal/CreatePostModal';


const Home = () => {

    const {
        allUsers,
        allPosts,
        user,
        love,
        handleClickLove,
        handleProfileButtonClick,
        isModalOpen,
        setIsModalOpen,
        handlePostCreated,
        lastPostElementRef,
        isLoadingPosts
    } = useHomeLogic();

    // Render Logic for Images
    const renderPostImages = (postImages: string[]) => {
        if (!postImages || postImages.length === 0) return null;

        if (postImages.length === 1) {
            return <img src={postImages[0]} alt="Post" className="img_content" />;
        }

        if (postImages.length === 2) {
            return (
                <div className="post-images-grid-2">
                    <img src={postImages[0]} alt="Post 1" />
                    <img src={postImages[1]} alt="Post 2" />
                </div>
            );
        }

        return (
            <div className="post-images-grid-3">
                <img src={postImages[0]} alt="Post 1" />
                <div className="side-images">
                    <img src={postImages[1]} alt="Post 2" />
                    <div className="more-images-container">
                        <img src={postImages[2]} alt="Post 3" />
                        {postImages.length > 3 && (
                            <div className="overlay">+{postImages.length - 3}</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="home">
            {user && (
                <div className="home-container">
                    <div className="main-content">
                        <div className="profile-container">
                            <div className="profile-header">
                                <img src={user.coverImage} alt="Background" className="bg-image" />
                                <div className="profile-info">
                                    <div className="avatar-container">
                                        <div className="follow-container">
                                            <p className="number">{user.followers?.length || 0}</p>
                                            <p className="text">Followers</p>
                                        </div>
                                        <img src={user.avatar} alt="Avatar" className="avatar-image" />
                                        <div className="follow-container">
                                            <p className="number">{user.following?.length || 0}</p>
                                            <p className="text">Following</p>
                                        </div>
                                    </div>

                                    <div className="more-info">
                                        <h3 className="profile-name">{user.fullname}</h3>
                                        <h3 className="profile-tag">{user.username}</h3>
                                        <p className="profile-description">
                                            {user.bio}
                                        </p>
                                        <button
                                            className="follow-button"
                                            onClick={handleProfileButtonClick}
                                        >
                                            My Profile
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="features">
                                <h2 className="head">Skills</h2>
                                <ul className="list-skill">
                                    <li className="item">UX Designer</li>
                                    <li className="item">Front End and Back End developer</li>
                                    <li className="item">JS Coder</li>
                                    <li className="item">Hacker</li>
                                    <li className="item">Scammer</li>
                                </ul>
                            </div>

                            <div className="features">
                                <h2 className="head">Communities</h2>
                                <ul className="list-coms">
                                    <li className="com-item">
                                        <img src={images.avaCom} alt="AvaCom" className="img-com" />
                                        <div className="com-info">
                                            <p className="com-name">UX Designer community</p>
                                            <p className="com-more">
                                                <i className="fa-solid fa-circle dot" />
                                                32 your friends are in
                                            </p>
                                        </div>
                                    </li>
                                    <li className="com-item">
                                        <img src={images.avaCom} alt="AvaCom" className="img-com" />
                                        <div className="com-info">
                                            <p className="com-name">UX Designer community</p>
                                            <p className="com-more">
                                                <i className="fa-solid fa-circle dot" />
                                                32 your friends are in
                                            </p>
                                        </div>
                                    </li>
                                    <li className="com-item">
                                        <img src={images.avaCom} alt="AvaCom" className="img-com" />
                                        <div className="com-info">
                                            <p className="com-name">UX Designer community</p>
                                            <p className="com-more">
                                                <i className="fa-solid fa-circle dot" />
                                                32 your friends are in
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="content-container">
                            <ul className="listStr">
                                <li className="strItem">
                                    <img src={images.avaFriend} alt="avaFriend" className="friendStr" />
                                </li>
                                <li className="strItem">
                                    <img src={images.avaFriend} alt="avaFriend" className="friendStr" />
                                </li>
                                <li className="strItem">
                                    <img src={images.avaFriend} alt="avaFriend" className="friendStr" />
                                </li>

                            </ul>

                            <div className="statusPost">
                                <img src={user.avatar} alt="avatar" className="imgPost" />
                                <input
                                    type="text"
                                    placeholder={`What's on your mind, ${user.fullname}?`}
                                    className="inputPost"
                                    readOnly={true}
                                    onClick={() => setIsModalOpen(true)}
                                    value="" // Just a placeholder now
                                    onChange={() => { }}
                                />
                                <i className="fa-solid fa-image sendIcon" onClick={() => setIsModalOpen(true)} />
                            </div>

                            <CreatePostModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                user={user}
                                onPostCreated={handlePostCreated}
                            />

                            <div className="newfeed">
                                {
                                    allPosts.map((post, index) => {
                                        const isLast = allPosts.length === index + 1;
                                        return (
                                            <div
                                                className="friendPost"
                                                key={post._id}
                                                ref={isLast ? lastPostElementRef : null}
                                            >
                                                <div className="ownerPost">
                                                    <img src={post.user?.avatar} alt="ownerAva" className="ownerAva" />
                                                    <div className="ownerInfo">
                                                        <p className="ownerTag">@{post.user?.username}</p>
                                                        <p className="ownerName">{post.user?.fullname}</p>
                                                        <span style={{ fontSize: '0.8rem', color: '#777', marginLeft: '10px' }}>
                                                            {post.privacy === 'public' ? <i className="fa-solid fa-globe"></i> : <i className="fa-solid fa-users"></i>}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="contentPost">
                                                    <p className="des_content"> {post.content} </p>
                                                    {renderPostImages(post.images || (post.image ? [post.image] : []))}
                                                </div>

                                                <div className="interactPost">
                                                    <i
                                                        className={`fa-heart love_icon ${love === true ? 'fa-solid is_loved' : 'fa-regular'}`}
                                                        onClick={handleClickLove}
                                                    >
                                                    </i>
                                                    <i className="fa-regular fa-comment comment_icon"></i>
                                                </div>

                                                <div className="break"></div>

                                                <div className="writeComment">
                                                    <img src={user.avatar} alt="avatar" className="avaUser" />
                                                    <input type="text" placeholder="Write your comment..." className="inputComment" />
                                                    <i className="fa-regular fa-paper-plane sendButton"></i>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                {isLoadingPosts && <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Loading...</div>}

                            </div>
                        </div>

                        <div className="friends-container">
                            <p className="contact-head">Contacts</p>
                            <div className="friendList">
                                {allUsers.map(friend => (
                                    <div key={friend._id} className="eachFriend">
                                        <img src={friend.avatar || images.friend1} alt="avaFriend" className="ava_eachFriend" />
                                        <p className="name_eachFriend">{friend.fullname}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
}

export default Home;