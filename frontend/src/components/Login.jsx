import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setAuthUser } from "../redux/userSlice";
import { Eye, EyeClosed } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginText, setLoginText] = useState("Log in");
  const { authUser } = useSelector((state) => state.user);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/health`, {
      withCredentials: true,
    });
    if (authUser) {
      navigate("/");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoginText("Logging in...");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/login`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        navigate("/");
        toast.success(res.data.message);
        dispatch(setAuthUser(res.data.user));
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoginText("Log in");
    }
    setFormData({
      username: "",
      password: "",
    });
  };

  return (
    <div className="flex justify-center max-w-screen items-center min-h-screen px-4 ">
      <div className="w-full max-w-xl p-8 rounded-xl shadow-xl bg-white/70 shadow-gray-700 border border-gray-300 h-full  bg-white-100 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 ">
        <h1 className="text-center text-3xl font-semibold text-[#3b3b3b] mb-6">
          Log in
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row md:items-center gap-x-4">
            <label htmlFor="username" className="w-32 font-bold text-[#2f2f2f]">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              autoComplete="username"
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              value={formData.username}
              placeholder="Enter your username"
              className="flex-1 p-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div className="flex relative flex-col md:flex-row md:items-center gap-x-4">
            <label htmlFor="password" className="w-32 font-bold text-[#2f2f2f]">
              Password
            </label>
            <div className="relative flex-1">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                value={formData.password}
                placeholder="Enter your password"
                className="w-full p-2 pr-10 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPass(!showPass)}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-600"
              >
                {showPass ? <Eye /> : <EyeClosed />}
              </button>
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              type="submit"
              className="bg-[#d6336c] hover:bg-[#c2215a] text-white font-semibold px-6 py-2 rounded transition duration-300"
            >
              {loginText}
            </button>
          </div>
        </form>
        <p className="text-center pt-1.5">
          Do not have an account?{" "}
          <Link to="/register" className="text-[#d6336c]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
