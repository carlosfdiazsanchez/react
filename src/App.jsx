
import { useEffect, useRef } from 'react';
import JsSIP from 'jssip';

// Si el navegador corre en el host que ejecuta Docker, usar host.docker.internal permite
// que el contenedor Asterisk vea la dirección del host en lugar de una IP de la red bridge (172.19.x.x).
// Para producción usa un dominio público y WSS.
const WS_URI = 'wss://asterisk.ridinn.com/ws';
const USER = '2002';
const AUTH_USER = '2002';
// Dominio público para producción
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
      // Hook simple onmessage para volcar mensajes SIP entrantes (raw) en la consola
      const origOnMessage = socket.onmessage;
      socket.onmessage = function (e) {
        try {
          const text = typeof e.data === 'string' ? e.data : new TextDecoder().decode(e.data);
          if (text && text.indexOf('\n') !== -1 && /INVITE|SIP\/2.0/.test(text)) {
            console.log('[FRONT][WS RAW] Received:', text.split('\n').slice(0,20).join('\n'));
          }
        } catch (err) {
          // ignore
        }
        if (typeof origOnMessage === 'function') origOnMessage.apply(this, arguments);
      };

      const configuration = {
        sockets: [socket],
    uri: `sip:${USER}@${DOMAIN}`,
    // Forzar Contact (incluye puerto y transporte) para que Asterisk reciba un host/puerto alcanzable
    contact_uri: `sip:${USER}@pbx.ridinn.com;transport=ws`,
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
        const session = data.session;
        const incoming = (data.originator === 'remote');
        try {
          console.log('[FRONT] session id/state:', session.id, session.startTime, session.status);
        } catch {}
        if (incoming) {
          console.log('[FRONT] Llamada entrante recibida:', session);
          // Añadir listeners de sesión para ver detalles SDP/peerconnection
          session.on('peerconnection', (ev) => {
            console.log('[FRONT][session] peerconnection event', ev);
          });
          session.on('accepted', () => console.log('[FRONT][session] accepted'));
          session.on('failed', (e) => console.log('[FRONT][session] failed', e));
          session.on('ended', (e) => console.log('[FRONT][session] ended', e));
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
        } catch {}
        uaRef.current = null;
      }
    };
  }, []);

  return null;
}

export default App;
