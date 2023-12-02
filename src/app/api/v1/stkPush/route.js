import axios from 'axios';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
export async function POST(req) {
  try {
    const { phoneNumber, amount } = await req.json();

    // Validate the phoneNumber and amount
    if (!phoneNumber || !amount) {
      return Response.json({ error: 'Missing phoneNumber or amount.' })
    }
    if (typeof phoneNumber !== 'string' || !/^(0|\+?254|254)\d{9}$/.test(phoneNumber)) {
      return Response.json({ error: 'Invalid phoneNumber.' })
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return Response.json({ error: 'Invalid amount.' })
    }
    console.log('number provided:', phoneNumber)
    const formattedPhoneNumber = phoneNumber.replace(/^(0|\+?254)/, '254')

    console.log('after formatting', formattedPhoneNumber)

    // Replace with your actual M-Pesa API credentials
    const consumerKey = process.env.MPESA_CONSUMER_KEY
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET
    const shortcode = process.env.MPESA_SHORTCODE

    // Generate an access token
    const {
      data: { access_token }
    } = await axios.get(process.env.MPESA_OAuth2Token_URL, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
      }
    })

    const now = new Date();
const timestamp = now.toISOString().replace(/[^0-9]/g, '').slice(0,14);
    

    // Generate the password by concatenating shortcode, passkey and timestamp, then encoding it in base64
    const password = Buffer.from(`${shortcode}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64')

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
      CallBackURL: `${process.env.DOMAIN}/api/v1/path/`,
      AccountReference: process.env.MPESA_INITIATOR_NAME,
      TransactionDesc: 'Payment of Units'
    }

    // Initiate the STK Push payment
    const { data: stkPushResponse } = await axios.post(process.env.MPESA_STKPush_URL, payload, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('STK Push initiated successfully', stkPushResponse)
    Response.json({ message: 'STK push initiated successfully' });


    // Check if the STK Push was successful
    if (stkPushResponse.ResponseCode === '0') {
      // Query the status of the STK Push payment with retries
      const maxRetries = 10 // Adjust the number of retries as needed
      let retryCount = 0

      while (retryCount < maxRetries) {
        // Wait for a few seconds before each retry (adjust the delay as needed)
        await sleep(30000) // 5 seconds

        const queryPayload = {
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: stkPushResponse.CheckoutRequestID
        }

        const queryResponse = await axios.post(process.env.MPESA_STKPushQuery_URL, queryPayload, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('STK Push Query response:', queryResponse.data)

        if (queryResponse.data.ResponseCode === '0' && queryResponse.data.ResultCode === '1032') {
          return Response.json({ status: 'cancelled', message: 'STK Push Canceled by User' })

         
        } else if (queryResponse.data.ResponseCode === '0' && queryResponse.data.ResultCode === '0') {
       
      

          return  Response.json({ status: 'success', message: 'Payment successful' })

        } else if (queryResponse.data.ResultCode === '1') {
          return  Response
            .json({ status: 'insufficient', message: 'The balance is insufficient for the transaction.' })

       
        } else if (queryResponse.data.ResultCode === '2001') {
          return Response.json({ status: 'invalid', message: 'The initiator information is invalid' })

         
        } else if (queryResponse.data.ResultCode === '1037') {
          return  Response.json({ status: 'timeout', message: 'timeout user cannot be reached' })

       
        } else if (queryResponse.data.ResultCode === '17') {
          return  Response.json({
            status: 'limit',
            message: 'Unable To Process your Request because a similar transaction is currently underway'
          })
        }

        retryCount++
      }

      // If maxRetries is reached and the status is still not successful
      console.error('STK Push query retries exceeded')
      return Response.json({ success: false, message: 'STK Push query retries exceeded' })
    } else {
      // Handle the case where STK Push was not successful
      console.error('STK Push failed with response code:', stkPushResponse.ResponseCode)
      return  Response.json({ success: false, message: 'STK Push failed' })
    }
  } catch (error) {
    console.error('Failed to initiate STK Push:', error)

    // Handle any errors that may occur during the payment process
    if (error.response && error.response.data) {
      return Response.json({ success: false, message: error.response.data.errorMessage })
    } else {
      return Response.json({ success: false, message: error.message })
    }
  }
}
