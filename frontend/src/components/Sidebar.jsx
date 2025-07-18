import { IoIosSearch } from "react-icons/io";
import OtherUsers from './OtherUsers';
import Logout from './Logout';
import useFetchUsers from '../hooks/useGetAllUsers';
import { useState } from "react";
import { useSelector } from 'react-redux';

const Sidebar = () => {
  useFetchUsers(); 

  const [searchText, setSearchText] = useState("");
   const { selectedUser } = useSelector((state) => state.otherUsers);

  return (
    <div className={`${selectedUser ? "hidden md:block  " : "block"} w-full  md:w-3/7 lg:w-1/3 h-[94vh] p-4 flex flex-col shadow-2xl shadow-gray-800 rounded-xl bg-gray-500/60 overflow-hidden `}>
      
      <form className="mb-4">
        <div className="flex items-center border border-gray-300 bg-white/70 backdrop-blur rounded-md shadow">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 font-semibold p-2 outline-none bg-transparent text-gray-800 placeholder:text-gray-500"
          />
          <button type="submit" className="p-2">
            <IoIosSearch className="text-gray-500 text-2xl cursor-pointer" />
          </button>
        </div>
      </form>


      <div className="flex-1 overflow-y-auto">
        <OtherUsers searchText={searchText} />
      </div>

  
      <div className="pt-4 border-t border-gray-300 mt-4">
        <Logout />
      </div>
    </div>
  );
};

export default Sidebar;
