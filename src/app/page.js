'use client'

import { useState } from 'react';

export default function StkPush() {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch('/api/stkpush', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });

    if (response.ok) {
      console.log('STK push initiated successfully');
    } else {
      console.error('Failed to initiate STK push');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',backgroundColor:'goldenrod' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
      Enter Phone Number

        <label>
          <input
            type="text"
            value={phoneNumber}
            required
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ margin: '10px 0', padding: '10px', borderRadius: '5px', border: '1px solid #ccc',backgroundColor: '#555555' }}
          />
        </label>
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', color: 'white', cursor: 'pointer' }}>Initiate STK Push</button>
      </form>
    </div>
  );
}
