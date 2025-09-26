
import { useEffect, useRef } from 'react';
import JsSIP from 'jssip';

const WS_URI = 'wss://asterisk.ridinn.com/ws';
const USER = '2002';
const AUTH_USER = '2002';
const DOMAIN = 'asterisk.ridinn.com';
const PASS = 'unaclavemuysegura';
const DISPLAY = '2002';

function App() {
  const uaRef = useRef(null);

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

  return null;
}

export default App;
