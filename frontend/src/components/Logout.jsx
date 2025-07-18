import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setOtherUsers,setSelectedUser } from "../redux/otherUsersSlice";
import { persistor } from "../redux/store";
import { setAuthUser } from "../redux/userSlice";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`,
        {
          withCredentials: true,
        }
      );
      console.log(res.data);

      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedUser(null));
        dispatch(setOtherUsers([]));
        persistor.purge();
        navigate("login");
        toast.success(res.data.message || "Logout successful");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };
  return (
    <div>
      <button className="btn btn-primary" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Logout;
