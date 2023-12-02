
import { NextResponse } from 'next/server';


import axios from 'axios';

export async function POST(req) {
  const { phoneNumber, amount } =  await req.json();
 

      console.log('number provided:', phoneNumber)
      const formattedPhoneNumber = phoneNumber.replace(/^(0|\+?254)/, '254')

      console.log('after formatting', formattedPhoneNumber)


  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortcode = process.env.MPESA_SHORTCODE;

  // Generate an access token
  const response = await axios.get(process.env.MPESA_OAuth2Token_URL, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
    },
  });

  const { access_token } = response.data;

  // Get the current date and time
  const now = new Date();

  // Extract date and time components
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // months are 0-indexed in JavaScript
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Combine components into a timestamp string
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

  // Generate the password by concatenating shortcode, passkey and timestamp, then encoding it in base64
  const password = Buffer.from(`${shortcode}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');

  // Construct the STK Push request payload
  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: formattedPhoneNumber,
    PartyB: shortcode,
    PhoneNumber: formattedPhoneNumber,
    CallBackURL: "https://intimate-barnacle-reasonably.ngrok-free.app",
    AccountReference: process.env.MPESA_INITIATOR_NAME,
    TransactionDesc: 'testing ',
  };

  // Initiate the STK Push payment
  const { data: stkPushResponse } = await axios.post(process.env.MPESA_STKPush_URL, payload, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
  })

  const stkPushData = stkPushResponse.data;

  console.log('STK Push initiated successfully', stkPushData);

  
    return NextResponse.json({ message: 'STK push initiated successfully' });
  } 
  