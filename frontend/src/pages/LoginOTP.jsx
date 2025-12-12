// src/pages/Login-otp.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// CORRECT IMPORT: Points to src/firebase.js
import { auth } from '../firebase'; 

const LeftIcon = ({ children }) => (
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
    {children}
  </div>
);

const LoginOTP = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [expandForm, setExpandForm] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const generateRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        }
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      generateRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      // Adds +91 automatically if user didn't type it
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setExpandForm(true);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Error sending OTP:", err);
      // Reset recaptcha
      if(window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      setError("Failed to send OTP. " + err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      setIsLoading(false);
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      navigate('/'); 
    } catch (err) {
      setIsLoading(false);
      setError("Invalid OTP. Please check and try again.");
    }
  };

  const inputClass = "block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent sm:text-sm transition duration-150 ease-in-out";

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen bg-white font-sans">
      {/* Left Side */}
      <div 
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 text-white relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://res.cloudinary.com/de1bg8ivx/image/upload/v1765192160/1_08426779-951c-47b7-9feb-ef29ca85b27c_frapuz.webp')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xl font-bold tracking-wide text-white">
              Urban<span className='text-gray-300'>Vastra</span>
            </span>
          </div>
          <h1 className="text-4xl font-light leading-tight mb-4 text-white drop-shadow-md">
            Secure Login.
          </h1>
        </div>
        <div className="relative z-10 text-sm text-gray-300 drop-shadow-sm">
          © 2024 UrbanVastra. All rights reserved.
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-8 lg:p-16 overflow-y-auto bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Login via OTP</h2>
            <p className="mt-2 text-sm text-gray-600">
              Go back to{' '}
              <Link to="/login" className="font-medium text-zinc-900 hover:text-zinc-700 underline underline-offset-2">
                Standard Login
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={expandForm ? handleVerifyOtp : handleSendOtp}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {!expandForm && (
                <div className="relative">
                  <label htmlFor="phone" className="sr-only">Phone Number</label>
                  <LeftIcon>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </LeftIcon>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={inputClass}
                    placeholder="Enter phone number"
                  />
                </div>
              )}

              {expandForm && (
                <div className="relative">
                  <label htmlFor="otp" className="sr-only">OTP</label>
                  <LeftIcon>
                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </LeftIcon>
                  <input
                    id="otp"
                    name="otp"
                    type="number"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={inputClass}
                    placeholder="Enter 6-digit OTP"
                  />
                </div>
              )}
              
              <div id="recaptcha-container"></div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? (expandForm ? "Verifying..." : "Sending OTP...") : (expandForm ? 'Verify OTP' : 'Send OTP')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginOTP;