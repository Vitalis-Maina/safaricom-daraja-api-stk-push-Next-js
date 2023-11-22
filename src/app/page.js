'use client';
import { useState } from 'react';
import axios from 'axios';

export default function StkPush() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const amountNumber = Number(amount);

    try {
      setLoading(true);

      const response = await axios.post('/api/v1/stkPush/', {
        phoneNumber,
        amount: amountNumber,
      });

      if (response.status === 200) {
        alert('STK push initiated successfully');
      } else {
        alert('Failed to initiate STK push');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while initiating STK push');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'goldenrod' }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}
      >
         Enter Phone Number
        <label>
         
          <input
            type="text"
            value={phoneNumber}
            required
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ margin: '10px 0', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#555555', color: 'white' }}
          />
        </label>
        Enter Amount
        <label>
         
          <input
            type="text"
            value={amount}
            required
            onChange={(e) => setAmount(e.target.value)}
            style={{ margin: '10px 0', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#555555', color: 'white' }}
          />
        </label>

        <button type="submit" style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', color: 'white', cursor: 'pointer', backgroundColor: loading ? '#999' : 'green' }} disabled={loading}>
          {loading ? 'Initiating...' : 'Initiate STK Push'}
        </button>
      </form>
    </div>
  );
}
