import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setOtherUsers } from "../redux/otherUsersSlice";

const useFetchUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user`, {
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
