
import { IoIosSearch } from "react-icons/io";
import OtherUsers from './OtherUsers';
import Logout from './Logout';
import useFetchUsers from '../hooks/useGetAllUsers';

const Sidebar = () => {
  useFetchUsers(); 

  return (
    <div className='w-full md:w-1/3 p-4 flex flex-col justify-between shadow-2xl shadow-pink-400 rounded-xl hover:shadow-pink-200 transition-all duration-300'>
      <form action="">
        <div className="flex items-center border border-gray-300 shadow rounded-md">
          <input type="text" placeholder='Search...' className="flex-1 font-semibold p-2 outline-none" />
          <button type="submit" className="p-2">
            <IoIosSearch className="text-gray-500 text-2xl cursor-pointer" />
          </button>
        </div>
      </form>

      <OtherUsers />
      <div className='mt-4'>
        <Logout />
      </div>
    </div>
  );
};

export default Sidebar;
