import React, { useState } from 'react';

export default function ExampleComponent() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <h1 style={{ marginBottom: '1rem' }}>Example Preview Component</h1>
      
      <div style={{
        padding: '1rem',
        background: '#f1f1f1',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}>
        <p>This is an example component that demonstrates the preview functionality.</p>
        <p>Current count: {count}</p>
        
        <button
          onClick={() => setCount(c => c + 1)}
          style={{
            background: '#0070f3',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          Increment Count
        </button>
      </div>

      <div style={{
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
      }}>
        <h2 style={{ marginTop: 0 }}>Preview Information</h2>
        <ul style={{ margin: 0 }}>
          <li>Component is interactive</li>
          <li>Supports hot reloading</li>
          <li>Uses React hooks</li>
          <li>Includes basic styling</li>
        </ul>
      </div>
    </div>
  );
} 