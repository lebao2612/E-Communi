import './IncomingCallModal.scss';
import { CallData } from '../../stores/webrtcStore';

interface IncomingCallModalProps {
    isVisible: boolean;
    callerEnv: CallData | null;
    onAccept: () => void;
    onReject: () => void;
}

const IncomingCallModal = ({
    isVisible,
    callerEnv,
    onAccept,
    onReject,
}: IncomingCallModalProps) => {
    if (!isVisible || !callerEnv) return null;

    return (
        <div className='incomingCallOverlay'>
            <div className='incomingCallModal'>
                <div className='callContent'>
                    <div className='callerInfo'>
                        <img src={callerEnv.callerAvatar} alt={`${callerEnv.callerName}'s avatar`} className='callerAvatar' />
                        <p className='callerName'>{callerEnv.callerName}</p>
                        <p className='callType'>
                            <i className={callerEnv.type === 'video' ? 'fa-solid fa-video' : 'fa-solid fa-phone'}></i>
                            {callerEnv.type === 'video' ? ' Video call' : ' Audio call'}
                        </p>
                    </div>

                    <div className='callActions'>
                        <button className='actionBtn reject' onClick={onReject}>
                            <i className="fa-solid fa-phone-slash"></i>
                        </button>
                        <button className='actionBtn accept' onClick={onAccept}>
                            <i className="fa-solid fa-phone"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
