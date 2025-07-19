import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/otherUsersSlice";


const OtherUsers = ({ searchText }) => {
  useGetAllUsers();
  const { otherUsers, onlineUsers } = useSelector((state) => state.otherUsers);
  const dispatch = useDispatch();
  const isOnline = (userId) => onlineUsers?.includes(userId);

  const selectUser = (user) => {
    dispatch(setSelectedUser(user));
   
  };

  const filteredUsers = (otherUsers || []).filter((user) =>
    user.fullName?.toLowerCase().startsWith(searchText.toLowerCase()) ||
    user.username?.toLowerCase().startsWith(searchText.toLowerCase())
  );

  return (
    <div className="px-1  custom-scrollbar">
      <div className="flex flex-col gap-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => selectUser(user)}
              className="flex  items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-pink-300 transition-all cursor-pointer"
            >
              <div className={`avatar ${isOnline(user._id) ? "avatar-online" : ""}  w-14 h-14 rounded-full `}>
                <img 
                  src={user.profilePhoto}
                  alt={user.fullName || "User"}
                  className="w-14 h-14 rounded-full  object-cover"
                />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  {user.fullName || user.username}
                </h2>
              
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-10">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default OtherUsers;
