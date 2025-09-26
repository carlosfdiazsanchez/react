import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { initSIP, onSIPEvent, stopSIP } from '../services/sipService';

const SIP_CONFIG = {
  wsUri: 'wss://asterisk.ridinn.com/ws',
  user: '2002',
  authUser: '2002',
  domain: 'asterisk.ridinn.com',
  pass: 'unaclavemuysegura',
  display: '2002',
};

const SipContext = createContext();

export function SipProvider({ children }) {
  const [incomingSession, setIncomingSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [caller, setCaller] = useState('');
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    initSIP(SIP_CONFIG);
    onSIPEvent('registered', () => setRegistered(true));
    onSIPEvent('unregistered', () => setRegistered(false));
    onSIPEvent('newRTCSession', (data) => {
      if (data.originator === 'remote') {
        setIncomingSession(data.session);
        setShowModal(true);
        const from = data.session.remote_identity && data.session.remote_identity.uri && data.session.remote_identity.uri.user;
        setCaller(from || 'Desconocido');
      }
    });
    return () => stopSIP();
  }, []);

  useEffect(() => {
    if (!incomingSession) return;
    const handleEnded = () => {
      setShowModal(false);
      setIncomingSession(null);
      setCaller('');
    };
    incomingSession.on('ended', handleEnded);
    incomingSession.on('failed', handleEnded);
    return () => {
      incomingSession.off('ended', handleEnded);
      incomingSession.off('failed', handleEnded);
    };
  }, [incomingSession]);

  const acceptCall = useCallback(() => {
    if (incomingSession) {
      incomingSession.answer({ mediaConstraints: { audio: true, video: false } });
    }
  }, [incomingSession]);

  const rejectCall = useCallback(() => {
    if (incomingSession) {
      incomingSession.terminate();
    }
  }, [incomingSession]);

  return (
    <SipContext.Provider value={{
      incomingSession,
      showModal,
      caller,
      registered,
      acceptCall,
      rejectCall,
    }}>
      {children}
    </SipContext.Provider>
  );
}

export function useSip() {
  return useContext(SipContext);
}
