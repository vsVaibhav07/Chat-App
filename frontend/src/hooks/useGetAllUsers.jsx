import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOtherUsers } from "../redux/otherUsersSlice";

const useFetchUsers = () => {
  const dispatch = useDispatch();
  const authUser=useSelector((state) => state.user.authUser);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/${authUser.id}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          dispatch(setOtherUsers(response.data.otherUsers));
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getAllUsers();
  }, [dispatch]);
};

export default useFetchUsers;
