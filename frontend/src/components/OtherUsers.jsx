import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/selectedUserSlice";

const OtherUsers = () => {
  const otherUsers = useSelector((state) => state.otherUsers.otherUsers);

  const dispatch=useDispatch();

  const selectUser=(user)=>{
    dispatch(setSelectedUser(user))
  }

  return (
    <div className="h-screen flex justify-start py-10 px-4 overflow-y-scroll">
      <div className="divide-y flex flex-col gap-y-2 divide-gray-200 w-full h-full max-w-md">
        {otherUsers && otherUsers.length > 0 ? (
          otherUsers.map((user) => (
            <div onClick={() => selectUser(user)}
              key={user._id}
              className="flex items-center gap-4 px-6 py-4 rounded-xl transition duration-300 cursor-pointer hover:shadow-[0_0_8px_#ff4dcf] bg-opacity-10 backdrop-blur-md"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <img
                  src={user.profilePhoto}
                  alt={user.fullName || "User"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {user.name || user.fullName}
                </h2>
                <p className="text-sm text-gray-500">
                  Hey there! I’m using ChatApp
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center w-full">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default OtherUsers;
