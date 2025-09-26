import JsSIP from "jssip";

let ua = null;
let listeners = {};

export function initSIP() {
  if (ua) return ua;

  const SIP_CONFIG = {
    wsUri: "wss://asterisk.ridinn.com/ws",
    user: "2002",
    authUser: "2002",
    domain: "asterisk.ridinn.com",
    pass: "unaclavemuysegura",
    display: "2002",
  };

  const socket = new JsSIP.WebSocketInterface(SIP_CONFIG.wsUri);
  const configuration = {
    sockets: [socket],
    uri: `sip:${SIP_CONFIG.user}@${SIP_CONFIG.domain}`,
    contact_uri: `sip:${SIP_CONFIG.user}@${SIP_CONFIG.domain}`,
    authorization_user: SIP_CONFIG.authUser,
    password: SIP_CONFIG.pass,
    display_name: SIP_CONFIG.display,
    register: true,
    session_timers: false,
    allowAnyIncoming: true,
  };
  ua = new JsSIP.UA(configuration);
  if (JsSIP && JsSIP.debug && typeof JsSIP.debug.disable === "function") {
    JsSIP.debug.disable();
  }

  Object.entries(listeners).forEach(([event, cbs]) => {
    cbs.forEach((cb) => ua.on(event, cb));
  });
  ua.start();
  return ua;
}

export function onSIPEvent(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
  if (ua) ua.on(event, callback);
}

export function stopSIP() {
  if (ua) {
    try {
      ua.stop();
    } catch {}
    ua = null;
  }
}
