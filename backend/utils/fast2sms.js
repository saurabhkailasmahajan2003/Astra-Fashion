import axios from 'axios';

const FAST2SMS_API_KEY = '1wFebuyq627952JQjs2c1Q4hafm8Ss5yGkxY44jX9uJbHXVGkimYiLoEmy2q';
const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

/**
 * Send OTP via Fast2SMS
 * @param {string} phoneNumber - Phone number (10 digits, without country code)
 * @param {string} otp - 6 digit OTP
 * @returns {Promise<Object>} - Response from Fast2SMS
 */
export const sendOTP = async (phoneNumber, otp) => {
  try {
    // Ensure phone number is 10 digits
    const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    if (cleanPhone.length !== 10) {
      throw new Error('Phone number must be 10 digits');
    }

    // Fast2SMS API v2 format - Use 'q' route (Quick SMS) which doesn't require website verification
    // The 'otp' route requires website verification, so we use 'q' route with a custom message
    const message = `Your OTP for login is ${otp}. Do not share this OTP with anyone. Valid for 10 minutes.`;
    
    // Use POST request with 'q' route (Quick SMS)
    const response = await axios.post(
      FAST2SMS_URL,
      {
        route: 'q',
        message: message,
        numbers: cleanPhone,
        flash: 0, // 0 for normal SMS, 1 for flash SMS
      },
      {
        headers: {
          'authorization': FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Fast2SMS Response:', response.data);

    // Fast2SMS returns success in return field
    if (response.data.return === true) {
      return {
        success: true,
        message: 'OTP sent successfully',
        requestId: response.data.request_id,
      };
    } else {
      const errorMsg = response.data.message || 'Failed to send OTP';
      console.error('Fast2SMS API Error:', errorMsg, response.data);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Fast2SMS Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    // In development, return OTP for testing but still show it failed
    if (process.env.NODE_ENV === 'development') {
      console.log('Fast2SMS failed in development mode. OTP for testing:', otp);
      // Still throw error so backend knows it failed
      throw new Error(`SMS failed: ${error.response?.data?.message || error.message}. Dev OTP: ${otp}`);
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to send OTP');
  }
};

