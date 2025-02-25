import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Comp/Logo";
import { getDatabase, ref, get } from "firebase/database";
import { app } from "../firebase";
import toast from 'react-hot-toast';
import Footer from "../Comp/Footer";
const db = getDatabase(app);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Logging in...');

    try {
      // Check Realtime Database for credentials
      const usersRef = ref(db, "user/admin/user1");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        
        // Compare credentials from Realtime Database
        if (userData.email === email && Number(userData.password) === Number(password)) {
          // Clear any existing auth state
          localStorage.clear();
          
          // Store new authentication state
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userType', email.endsWith('@admin.com') ? 'admin' : 'user');
          
          toast.success('Login successful!', { id: toastId });

          // Navigate based on user type
          if (email.endsWith('@admin.com')) {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } else {
          toast.error('Invalid email or password', { id: toastId });
        }
      } else {
        toast.error('User not found', { id: toastId });
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error('An error occurred during login. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50 to-emerald-50 relative">
      <div className="absolute top-4 left-4">
        <Logo />
      </div>

      <div className="w-full md:max-w-[80%] lg:max-w-5xl xl:max-w-6xl h-screen md:h-auto md:min-h-[600px] bg-white md:rounded-xl shadow-2xl overflow-hidden border-0 md:border md:border-green-500/20">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full h-full px-6 py-8 md:w-1/2 flex items-center justify-center bg-gradient-to-br from-white via-green-50 to-emerald-50">
            <div className="w-full max-w-[400px] mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">Login</h1>

              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="block text-left text-sm font-medium text-gray-600">Email</label>
                  <input
                    type="email"
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all text-gray-800 placeholder-gray-400 text-base"
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-left text-sm font-medium text-gray-600">Password</label>
                  <input
                    type="password"
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all text-gray-800 placeholder-gray-400 text-base"
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                  />
                </div>
                <div className="flex flex-row items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-green-600 bg-white border-gray-200 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-gray-600">Remember me</span>
                  </label>
                  <Link
                    to="/forgotpass"
                    className="text-green-600 hover:text-green-500 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="h-12 mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full h-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-base font-medium rounded-md transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="hidden md:block md:w-1/2 max-h-full bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="h-full p-8">
              <img
                src="../src/assets/image.png"
                alt="Login Illustration"
                className="w-full h-full object-cover rounded-lg shadow-lg ring-1 ring-green-500/20"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Login;