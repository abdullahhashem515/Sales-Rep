import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import logo from '../../assets/logo.png'; // Assuming this path is correct
import { ToastContainer, toast } from 'react-toastify'; // NEW: Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // NEW: Import toastify CSS (ensure this is also imported globally in your app)


export default function Login() {
  const navigate = useNavigate();
  // State variables to hold email, password, and error messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator
  const [generalError, setGeneralError] = useState(''); // New state for general API errors

  // Function to handle form submission
  const handleSubmit = async (e) => { // Make handleSubmit async
    e.preventDefault(); // Prevent default form submission behavior

    // Reset all error messages before new validation
    setEmailError('');
    setPasswordError('');
    setGeneralError(''); // Reset general error

    let isValid = true; // Flag to track overall form validity

    // 1. Validate if email field is empty
    if (!email.trim()) {
      setEmailError('البريد الإلكتروني مطلوب.');
      isValid = false;
    } else if (!/\S+@\S+\.\S/.test(email)) { // 2. Validate email format using regex
      setEmailError('صيغة البريد الإلكتروني غير صحيحة.');
      isValid = false;
    }

    // 3. Validate if password field is empty
    if (!password.trim()) {
      setPasswordError('كلمة السر مطلوبة.');
      isValid = false;
    } else if (password.length < 8) { // Validate password minimum length
      setPasswordError('يجب أن تتكون كلمة السر من 8 أحرف على الأقل.');
      isValid = false;
    }

    // If validations fail, stop here
    if (!isValid) {
      return;
    }

    setIsLoading(true); // Set loading to true when starting API call

    try {
      // Using axios.post for login request
      // This request typically doesn't send an Authorization header
      const response = await axios.post('https://alameenapp-backend.novelsoft.com.co/api/auth/login-web', {
        email, // axios automatically serializes to JSON
        password,
      });

      // axios wraps the response data in a 'data' property
      console.log("Login successful:", response.data);

      // Assuming your backend returns a token in response.data.token
      // It's crucial to save this token for future authenticated requests
      if (response.data && response.data.token) {
        localStorage.setItem('userToken', response.data.token); // Save the token to localStorage
        console.log("Token saved:", response.data.token);
        toast.success('تم تسجيل الدخول بنجاح!'); // Show success toast
        navigate("/dashboard"); // Navigate to dashboard on success ONLY if token is received
      } else {
        // NEW: If login is successful but no token, treat it as a login failure
        const errorMessage = 'لا يوجد الحساب في النظام';
        setGeneralError(errorMessage);
        toast.error(errorMessage); // Show error toast
        console.error("Login successful, but no token received from backend. Preventing navigation."); // Log error
        // Do NOT navigate to dashboard here
      }

    } catch (error) {
      // axios handles errors differently:
      // error.response for server errors (e.g., 400, 401, 500)
      // error.request if the request was made but no response was received (network error)
      // other errors for anything else
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Login failed (server error):", error.response.data);
        const errorMessage = error.response.data.message || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.';
        setGeneralError(errorMessage);
        toast.error(errorMessage); // Show error toast with backend message
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Login failed (network error):", error.request);
        const errorMessage = 'حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
        setGeneralError(errorMessage);
        toast.error(errorMessage); // Show error toast for network issues
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Login failed (other error):", error.message);
        const errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
        setGeneralError(errorMessage);
        toast.error(errorMessage); // Show error toast for other errors
      }
    } finally {
      setIsLoading(false); // Always set loading to false after API call
    }
  };

  return (
    <>
      {/* Tailwind CSS for global styles should be loaded in your index.html or equivalent */}
      {/* <script src="https://cdn.tailwindcss.com"></script> */}
      <div className="SeconsryColor w-screen h-screen flex items-center justify-center" dir="rtl">
        <div className="primaryColor flex flex-col px-0 pt-0 pb-0 lg:px-8 w-[35vw] h-[90vh] rounded-2xl">
          <div className='mt-15 mb-10'>
            <img
              alt="Your Company"
              src={logo}
              className="mx-auto h-35"
            />
          </div>

          <div className="mt-0 sm:mx-auto sm:w-full sm:max-w-sm">
            {/* The form's onSubmit handles the submission logic */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="amiriFont block text-primary text-[18px]"
                >
                  البريد الإلكتروني
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="text"
                    value={email} // Bind input value to state
                    onChange={(e) => setEmail(e.target.value)} // Update state on change
                    placeholder='البريد الإلكتروني'
                    autoComplete="email"
                    className={`block w-full h-[50px] bg-white/5 px-3 py-1.5 text-base text-black rounded-lg shadow-md border ${
                      emailError ? 'border-red-500' : 'border-gray-200'
                    } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="amiriFont block text-primary text-[18px]"
                  >
                    كلمة السر
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password} // Bind input value to state
                    onChange={(e) => setPassword(e.target.value)} // Update state on change
                    placeholder='كلمة السر'
                    autoComplete="current-password"
                    className={`block w-full h-[50px] bg-white/5 px-3 py-1.5 text-base text-black rounded-lg shadow-md border ${
                      passwordError ? 'border-red-500' : 'border-gray-200'
                    } placeholder:text-gray-500 sm:text-sm/6`}
                  />
                  {passwordError && (
                    <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                  )}
                </div>
              </div>

              {generalError && (
                <p className="text-red-500 text-sm text-center mt-4">{generalError}</p>
              )}

              <div className='mt-10'>
                <button
                  type="submit" // This button triggers the form's onSubmit
                  className="SeconsryColor amiriFont flex w-full h-[45px] items-center justify-center rounded-lg shadow-md bg-indigo-500 px-3 py-1.5 mb-6 text-base font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? 'جاري الدخول...' : 'تسجيل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer /> {/* NEW: Add ToastContainer here */}
    </>
  );
}
