import React from 'react';
import { useSip } from '../context/SipContext';

function SipStatus() {
  const { registered, incomingSession } = useSip();
  return (
    <div style={{margin: 16, padding: 8, background: '#eee', borderRadius: 4}}>
      <div>Estado SIP: {registered ? 'Registrado' : 'No registrado'}</div>
      <div>Llamada activa: {incomingSession ? 'Sí' : 'No'}</div>
      <audio id='remoteAudio' controls loop style={{ display: 'none', width: '1px', height: '1px' }}></audio>
    </div>
  );
}

export default SipStatus;
