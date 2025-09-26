import React from 'react';
import { useSip } from '../context/SipContext';

function SipStatus() {
  const { registered, incomingSession } = useSip();
  return (
    <div style={{margin: 16, padding: 8, background: '#eee', borderRadius: 4}}>
      <div>Estado SIP: {registered ? 'Registrado' : 'No registrado'}</div>
      <div>Llamada activa: {incomingSession ? 'Sí' : 'No'}</div>
    </div>
  );
}

export default SipStatus;
