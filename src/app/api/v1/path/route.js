// Handler to handle the request
export async function POST(req) {
    try {
    
      const { method, url, body } = req;
  
      // Log request details
      console.log(`Received ${method} request at ${url}`);
      console.log('Body:', body);
  
      // Extract specific properties directly from the body object
      const { MerchantRequestID, CheckoutRequestID, ResultCode, CallbackMetadata } = body.Body.stkCallback;
  
      // Log extracted properties
      console.log('MerchantRequestID:', MerchantRequestID);
      console.log('CheckoutRequestID:', CheckoutRequestID);
      console.log('ResultCode:', ResultCode);
      console.log('CallbackMetadata:', CallbackMetadata);
  
      if (CallbackMetadata && CallbackMetadata.Item) {
        let callbackMetadata = CallbackMetadata.Item;
  
        let amount, receipt_number, phone_number;
        const transactionDate = new Date(); // Current date and time
  
        callbackMetadata.forEach(item => {
          let name = item.Name;
          let value = item.Value;
          console.log(`Name: ${name}, Value: ${value}`);
  
          if (name === 'Amount') {
            amount = value;
          } else if (name === 'MpesaReceiptNumber') {
            receipt_number = value;
          } else if (name === 'PhoneNumber') {
            phone_number = String(value);
          }
        });
  
        // Handle the extracted data as needed...
  
        // Return a response
        return Response.json({ message: 'POST request received' });
      } else {
        console.log('CallbackMetadata or CallbackMetadata.Item is undefined');
        return Response.json({ message: 'CallbackMetadata or CallbackMetadata.Item is undefined' });
      }
    } catch (error) {
      console.error('Error:', error);
      return Response.json({ message: 'An unexpected error occurred' });
    }
  }
  