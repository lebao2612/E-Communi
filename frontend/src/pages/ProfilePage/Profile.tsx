
import './profile.scss'
import images from "../../assets/images/index";
import { useProfileLogic } from '../../scripts/profile';

const Profile = () =>{

    const {
        user,
        love,
        handleClickLove,
    } = useProfileLogic();

    return (
        <div className='profilePage'>
            <div className='profile'>
                <img src={images.anhnen} alt='background' className='backgroundImg' />
                <div className='infoGroup'>
                    <div className='avaGroup'>
                        <div className='avaPr'>
                            <img src={images.avatar} alt='avatar' className='avatarUser'/>
                            <i className="fa-solid fa-camera"></i>
                        </div>
                        <div className='namePr'>
                            <p className='name'>{user.name}</p>
                            <p className='username'>@{user.username}</p>
                        </div>
                    </div>
                   
                    <div className='changeProfile'>
                        <i className="fa-solid fa-pen"></i>
                        <p className=''>Chỉnh sửa profile</p>
                    </div>
                </div>
            </div>

            <div className='listPost'>
                <div className="friendPost">
                    <div className="ownerPost">
                        <img src={images.avatar} alt="ownerAva" className="ownerAva"/>
                        <div className="ownerInfo">
                            <p className="ownerTag">@{user.username}</p>
                            <p className="ownerName">{user.name}</p>
                        </div>
                    </div>

                    <div className="contentPost">
                        <p className="des_content"> My lover is Chung SuBin </p>
                        <img src={images.mylove} alt="myloveCouple" className="img_content"/>
                    </div>

                    <div className="interactPost">
                        {/* fa-solid se la cai de lam nhan nut love */}
                        <i 
                            className = {`fa-heart love_icon ${love === true ? 'fa-solid is_loved' : 'fa-regular'}`}
                            onClick={handleClickLove}
                        >
                        </i>
                        <i className="fa-regular fa-comment comment_icon"></i>
                    </div>

                    <div className="break"></div>

                    <div className="writeComment">
                        <img src={images.avatar} alt="avatar" className="avaUser"/>
                        <input type="text" placeholder="Write your comment..." className="inputComment"/>
                        <i className="fa-regular fa-paper-plane sendButton"></i>
                    </div>
                </div>
            </div>

        </div>
        
    )
}


export default Profile;