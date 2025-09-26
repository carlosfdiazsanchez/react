import React from 'react';
import './IncomingCallModal.css';

export default function IncomingCallModal({ caller, onAccept, onReject }) {
  return (
    <div className="incoming-call-modal">
      <div className="modal-content">
        <h2>Llamada entrante</h2>
        <p>{caller ? `De: ${caller}` : 'Llamada desconocida'}</p>
        <div className="modal-actions">
          <button className="accept" onClick={onAccept}>Aceptar</button>
          <button className="reject" onClick={onReject}>Rechazar</button>
        </div>
      </div>
    </div>
  );
}
