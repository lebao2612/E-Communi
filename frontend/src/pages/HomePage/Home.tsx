import "./home.scss";
import '@fortawesome/fontawesome-free/css/all.min.css';
import images from "../../assets/images/index";
import { useHomeLogic } from '../../scripts/home';


const Home = () => {

    const {
        allUsers,
        allPosts,
        user,
        love,
        postContent,
        setPostContent,
        handlePostButtonClick,
        handleClickLove,
        handleProfileButtonClick,
    } = useHomeLogic()

    //console.log(allUsers)
    console.log(allPosts)

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
                                            <p className="number">2612</p>
                                            <p className="text">Followers</p>
                                        </div>
                                        <img src={user.avatar} alt="Avatar" className="avatar-image" />
                                        <div className="follow-container">
                                            <p className="number">2004</p>
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
                                    placeholder="Tell your friends about your thought..."
                                    className="inputPost"
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                />
                                <i className="fa-solid fa-paper-plane sendIcon" onClick={handlePostButtonClick} />
                            </div>

                            <div className="newfeed">
                                {
                                    allPosts.map((post) => (
                                        <div className="friendPost" key={post._id}>
                                            <div className="ownerPost">
                                                <img src={post.user?.avatar} alt="ownerAva" className="ownerAva" />
                                                <div className="ownerInfo">
                                                    <p className="ownerTag">@{post.user?.username}</p>
                                                    <p className="ownerName">{post.user?.fullname}</p>
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
                                                <img src={user.avatar} alt="avatar" className="avaUser" />
                                                <input type="text" placeholder="Write your comment..." className="inputComment" />
                                                <i className="fa-regular fa-paper-plane sendButton"></i>
                                            </div>
                                        </div>
                                    ))
                                }

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