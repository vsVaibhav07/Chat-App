import { IoIosSearch } from "react-icons/io";
import OtherUsers from "./OtherUsers";
import Logout from "./Logout";
import useFetchUsers from "../hooks/useGetAllUsers";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserProfile } from "../redux/userSlice";

const Sidebar = () => {
  useFetchUsers();

  const [searchText, setSearchText] = useState("");
  const { selectedUser } = useSelector((state) => state.otherUsers);
  const {authUser}=useSelector((state)=>state.user)
  const dispatch=useDispatch();

  const handleProfile=()=>{
    dispatch(setUserProfile("view"));
  }
  return (
    <div
      className={`${
        selectedUser ? "hidden md:flex  " : "block"
      } w-full  md:w-3/7 lg:w-1/3 h-[94vh] px-0.5 sm:px-4 py-4 flex flex-col shadow-2xl shadow-gray-800 rounded-xl bg-gray-500/60 overflow-hidden `}
    >
      <div className="flex gap-1 sm:gap-2  px-1">
        <div className="avatar cursor-pointer">
          <div onClick={handleProfile} className="ring-primary ring-offset-base-100 w-10 h-10 rounded-full ring-2 ring-offset-2">
            <img src={authUser.profilePhoto} />
          </div>
        </div>

        <form className="mb-4 w-[90%] flex-1">
          <div className="flex items-center border border-gray-300 bg-white/70 backdrop-blur rounded-md shadow">
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 w-[90%] font-semibold p-2 outline-none bg-transparent text-gray-800 placeholder:text-gray-500"
            />
            <button type="submit" className="p-2">
              <IoIosSearch className="text-gray-500 text-2xl cursor-pointer" />
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        <OtherUsers searchText={searchText} />
      </div>

      <div className="pt-4 border-t bottom-10 h-max-10 border-gray-300 mt-4">
        <Logout />
      </div>
    </div>
  );
};

export default Sidebar;
