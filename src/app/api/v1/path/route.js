import Cors from 'cors'


// Initialize the cors middleware
const cors = Cors({
  origin: '*', // Allow requests from any origin during development
  methods: ['POST']
})

// Handler to use cors middleware and handle the request
export async function POST(req, res) {
  try {  
    cors(req, res, async () => {
      const { method, url, headers, body } = req

      // Log request details
      console.log(`Received ${method} request at ${url}`)
      console.log('Headers:', headers)
      console.log('Body:', body)

      // Extract specific properties directly from the body object
      const { MerchantRequestID, CheckoutRequestID, ResultCode, CallbackMetadata } = body.Body.stkCallback

      // Log extracted properties
      console.log('MerchantRequestID:', MerchantRequestID)
      console.log('CheckoutRequestID:', CheckoutRequestID)
      console.log('ResultCode:', ResultCode)
      console.log('CallbackMetadata:', CallbackMetadata)

      if (CallbackMetadata && CallbackMetadata.Item) {
        let callbackMetadata = CallbackMetadata.Item

        let amount, receipt_number, phone_number
        const transactionDate = new Date() // Current date and time

        callbackMetadata.forEach(item => {
          let name = item.Name
          let value = item.Value
          console.log(`Name: ${name}, Value: ${value}`)

          if (name === 'Amount') {
            amount = value
          } else if (name === 'MpesaReceiptNumber') {
            receipt_number = value
          } else if (name === 'PhoneNumber') {
            phone_number = String(value)
          }
        })

      
         
      } else {
        console.log('CallbackMetadata or CallbackMetadata.Item is undefined')
      }

      // Return a response
      res.status(200).json({ message: 'POST request received' })
    })
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
}

