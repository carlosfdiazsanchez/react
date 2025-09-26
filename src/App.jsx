
import React from 'react';
import { useSip } from './context/SipContext';
import SipStatus from './components/SipStatus';

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


function App() {
  const { incomingSession, showModal, caller, acceptCall, rejectCall } = useSip();
  const [modalOpen, setModalOpen] = React.useState(false);

  // Sincroniza el estado del modal con el contexto SIP
  React.useEffect(() => {
    setModalOpen(showModal);
  }, [showModal]);

  // Cierra el modal cuando la llamada termina
  React.useEffect(() => {
    if (!incomingSession && modalOpen) setModalOpen(false);
  }, [incomingSession, modalOpen]);

  const handleAccept = () => {
    acceptCall();
    setModalOpen(false);
  };

  const handleReject = () => {
    rejectCall();
    setModalOpen(false);
  };

  return (
    <>
      <SipStatus />
      <IncomingCallModal
        open={modalOpen}
        caller={caller}
        onAccept={handleAccept}
        onReject={handleReject}
      />
      {/* Aquí puedes renderizar el resto de tu app */}
    </>
  );
}

export default App;
