import axios from 'axios';
import { useState } from "react";
import toast from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const navigate=useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
        const res= await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/register`, formData,{headers:{'Content-Type':'application/json'},withCredentials:true});
        if(res.data.success){
            navigate('/login');
            toast.success(res.data.message);
        }
    } catch (error) {
        toast.error(error.response?.data?.message);
    }
   
    setFormData({
      fullName: "",username: "",gender: "",password: "",confirmPassword: "",
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 ">
      <div className="w-full max-w-xl p-8 rounded-xl bg-white/70 shadow-xl shadow-gray-700 border border-gray-300 h-full  bg-white-100 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 ">
        <h1 className="text-center text-3xl font-semibold text-[#3b3b3b] mb-6">
          Sign Up
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="fullname" className="w-32 font-bold text-[#2f2f2f]">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              id="fullname"
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
              value={formData.fullName}
              placeholder="Enter your name"
              className="flex-1 p-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div className="flex items-center gap-4">
            <label htmlFor="username" className="w-32 font-bold text-[#2f2f2f]">
              Username
            </label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              id="username"
              required
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              value={formData.username}
              placeholder="Enter your username"
              className="flex-1 p-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-32 font-bold text-[#2f2f2f]">Gender</label>
            <div className="flex gap-6">
              <label className="text-[#2f2f2f] font-medium">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  required
                  checked={formData.gender === "male"}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="mr-1 checkbox"
                />
                Male
              </label>
              <label className="text-[#2f2f2f] font-medium">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="mr-1 checkbox"
                />
                Female
              </label>
            </div>
          </div>

          {/* Password */}
          <div className="flex items-center gap-4">
            <label htmlFor="password" className="w-32 font-bold text-[#2f2f2f]">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              id="password"
              autoComplete="new-password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              value={formData.password}
              placeholder="Enter your password"
              className="flex-1 p-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="confirm_password"
              className="w-32 font-bold text-[#2f2f2f]"
            >
              Confirm
            </label>
            <input
              type="password"
              required
              name="confirm_password"
              id="confirm_password"
              autoComplete="new-password" 
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              value={formData.confirmPassword}
              placeholder="Confirm your password"
              className="flex-1 p-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div className="text-center mt-6">
            <button
              type="submit"
              className="bg-[#d6336c] hover:bg-[#c2215a] text-white font-semibold px-6 py-2 rounded transition duration-300"
            >
              Sign Up
            </button>
          </div>
        </form>
        <p className="text-center pt-1.5">
          Already have an account?{" "}
          <Link to="/login" className="text-[#d6336c]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
