import {useAuth} from '../../contexts/AuthContext'


const Setting = () => {

    const {logout} = useAuth();


    return (
        <div>
            Setting Page
            <button
                className='logoutButton'
                onClick={logout}
            >
                logout
            </button>
        </div>
    )
}

export default Setting;