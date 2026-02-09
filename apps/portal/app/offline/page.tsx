'use client';

import { useState } from 'react';

export default function OfflinePage() {
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState('');

  const handleStart = async () => {
    setStarting(true);
    setMessage('Starting M-Suite services...');
    
    try {
      const res = await fetch('/api/suite/start', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Services starting... Redirecting to portal...');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setMessage(`Error: ${data.message}`);
        setStarting(false);
      }
    } catch (error) {
      setMessage('Failed to start services. Please try again.');
      setStarting(false);
    }
  };

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          M-Suite is Offline
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: '#94a3b8',
          marginBottom: '2rem',
        }}>
          The suite is not currently running. Click below to start all services.
        </p>

        <button
          onClick={handleStart}
          disabled={starting}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#0f172a',
            background: starting 
              ? '#94a3b8' 
              : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: starting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {starting ? 'Starting...' : 'Launch M-Suite'}
        </button>

        {message && (
          <p style={{
            marginTop: '1.5rem',
            color: '#fbbf24',
            fontSize: '1rem',
          }}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
