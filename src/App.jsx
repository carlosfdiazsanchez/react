
import { useEffect, useRef, useState } from 'react';
// Modal simple para llamadas entrantes
function IncomingCallModal({ open, caller, onAccept, onReject }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 300, textAlign: 'center' }}>
        <h2>Llamada entrante</h2>
        <p>{caller ? `De: ${caller}` : 'Llamada desconocida'}</p>
        <button onClick={onAccept} style={{ marginRight: 16, background: '#4caf50', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4 }}>Aceptar</button>
        <button onClick={onReject} style={{ background: '#f44336', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4 }}>Rechazar</button>
      </div>
    </div>
  );
}
import JsSIP from 'jssip';

const WS_URI = 'wss://asterisk.ridinn.com/ws';
const USER = '2002';
const AUTH_USER = '2002';
const DOMAIN = 'asterisk.ridinn.com';
const PASS = 'unaclavemuysegura';
const DISPLAY = '2002';


function App() {
  const uaRef = useRef(null);
  const [incomingSession, setIncomingSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [caller, setCaller] = useState('');

  useEffect(() => {
    if (JsSIP && JsSIP.debug && typeof JsSIP.debug.disable === 'function') {
      JsSIP.debug.disable();
    }
    if (!uaRef.current) {
      const socket = new JsSIP.WebSocketInterface(WS_URI);
      const configuration = {
        sockets: [socket],
        uri: `sip:${USER}@${DOMAIN}`,
        contact_uri: `sip:${USER}@${DOMAIN}`,
        authorization_user: AUTH_USER,
        password: PASS,
        display_name: DISPLAY,
        register: true,
        session_timers: false,
        allowAnyIncoming: true,
      };
      const ua = new JsSIP.UA(configuration);
      ua.on('registered', () => {
        console.log('[FRONT] Registrado OK');
      });
      ua.on('newRTCSession', (data) => {
        console.log('[FRONT] Evento newRTCSession', data);
        // Solo mostrar modal si es una llamada entrante
        if (data.originator === 'remote') {
          setIncomingSession(data.session);
          setShowModal(true);
          const from = data.session.remote_identity && data.session.remote_identity.uri && data.session.remote_identity.uri.user;
          setCaller(from || 'Desconocido');
        }
      });
      ua.on('newMessage', (data) => {
        console.log('[FRONT] newMessage', data);
      });
      ua.on('sipEvent', (e) => {
        console.log('[FRONT] sipEvent', e);
      });
      ua.on('connected', () => {
        console.log('[FRONT] UA connected');
      });
      ua.on('transportError', (e) => {
        console.log('[FRONT] UA transportError', e);
      });
      ua.on('unregistered', () => {
        console.log('[FRONT] UA unregistered');
      });
      ua.on('registrationFailed', (e) => {
        console.log('[FRONT] UA registrationFailed', e);
      });
      ua.on('disconnected', () => {
        console.log('[FRONT] UA disconnected');
      });
      ua.start();
      uaRef.current = ua;
    }

    return () => {
      if (uaRef.current) {
        try {
          uaRef.current.stop();
          console.log('[FRONT] UA detenida');
        } catch { }
        uaRef.current = null;
      }
    };
  }, []);

  // Limpiar modal si la llamada termina sola
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

  const handleAccept = () => {
    if (incomingSession) {
      incomingSession.answer({
        mediaConstraints: { audio: true, video: false },
      });
      setShowModal(false);
    }
  };

  const handleReject = () => {
    if (incomingSession) {
      incomingSession.terminate();
      setShowModal(false);
    }
  };

  return (
    <>
      <IncomingCallModal
        open={showModal}
        caller={caller}
        onAccept={handleAccept}
        onReject={handleReject}
      />
      {/* Aquí puedes renderizar el resto de tu app */}
    </>
  );
}

export default App;
