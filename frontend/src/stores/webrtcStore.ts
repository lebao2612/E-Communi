import { create } from 'zustand';

export interface CallData {
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  type: 'audio' | 'video';
}

interface WebRTCStoreState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  receivingCall: boolean;
  callerEnv: CallData | null;
  callAccepted: boolean;
  currentPartnerId: string | null;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setIncomingCall: (callData: CallData) => void;
  setCallAccepted: (accepted: boolean) => void;
  setCurrentPartnerId: (partnerId: string | null) => void;
  resetCallState: () => void;
}

export const useWebRTCStore = create<WebRTCStoreState>((set) => ({
  localStream: null,
  remoteStream: null,
  receivingCall: false,
  callerEnv: null,
  callAccepted: false,
  currentPartnerId: null,

  setLocalStream: (stream) => set({ localStream: stream }),

  setRemoteStream: (stream) => set({ remoteStream: stream }),

  setIncomingCall: (callData) =>
    set({
      receivingCall: true,
      callerEnv: callData,
      currentPartnerId: callData.callerId,
    }),

  setCallAccepted: (accepted) => set({ callAccepted: accepted }),

  setCurrentPartnerId: (partnerId) => set({ currentPartnerId: partnerId }),

  resetCallState: () =>
    set({
      localStream: null,
      remoteStream: null,
      receivingCall: false,
      callerEnv: null,
      callAccepted: false,
      currentPartnerId: null,
    }),
}));
