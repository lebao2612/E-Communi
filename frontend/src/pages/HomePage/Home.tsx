import "./home.scss";
import '@fortawesome/fontawesome-free/css/all.min.css';
import images from "../../assets/images/index";
import { useHomeLogic } from '../../scripts/home';
import CreatePostModal from '../../components/CreatePostModal/CreatePostModal';
import Post from '../../components/Post/Post';


const Home = () => {

    const {
        allUsers,
        allPosts,
        user,
        handleProfileButtonClick,
        isModalOpen,
        setIsModalOpen,
        handlePostCreated,
        lastPostElementRef,
        isLoadingPosts
    } = useHomeLogic();

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
                                            <Post
                                                key={post._id}
                                                post={post}
                                                currentUserAvatar={user?.avatar}
                                                lastPostElementRef={isLast ? lastPostElementRef : undefined}
                                            />
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