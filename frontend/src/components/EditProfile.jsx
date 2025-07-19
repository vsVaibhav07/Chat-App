import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setAuthUser, setUserProfile } from "../redux/userSlice";

const EditProfile = () => {
  const { user } = useSelector((store) => store.user);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

 
  const [input, setInput] = useState({
    fullName: "",
    bio: "",
    gender: "",
    profilePhoto: null,
  });

  const [previewImage, setPreviewImage] = useState("");


  useEffect(() => {
    if (user) {
      setInput({
        fullName: user.fullName || "",
        bio: user.bio || "",
        gender: user.gender || "",
        profilePhoto: user.profilePhoto || "",
      });
      setPreviewImage(user.profilePhoto || "");
    }
  }, [user]);

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput((prev) => ({ ...prev, profilePhoto: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCancle=()=>{
    dispatch(setUserProfile(null));
  }
  const editProfileHandler = async () => {
    const formData = new FormData();
    formData.append("fullName", input.fullName);
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    if (input.profilePhoto && typeof input.profilePhoto !== "string") {
      formData.append("profilePhoto", input.profilePhoto);
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/editProfile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        const updatedUser = {
          ...user,
          fullName: res.data.user?.fullName,
          bio: res.data.user?.bio,
          gender: res.data.user?.gender,
          profilePhoto: res.data.user?.profilePhoto,
        };
        dispatch(setAuthUser(updatedUser));
        navigate(`/`);
        dispatch(setUserProfile(null))
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 text-white">
      <div className="w-full max-w-md bg-gray-900/90 rounded-xl p-6 shadow-lg space-y-4">
        <h2 className="text-2xl font-bold text-center">Edit Profile</h2>

        {/* Profile Image */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-offset-2 ring-pink-500">
            <img
              src={
                previewImage ||
                "https://img.daisyui.com/images/profile/demo/spiderperson@192.webp"
              }
              alt="Profile Preview"
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <label className="flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-lg cursor-pointer transition text-sm">
          Change Photo
          <input
            type="file"
            accept="image/*"
            onChange={fileChangeHandler}
            className="hidden"
            name="profilePhoto"
          />
        </label>

       
        <input
          type="text"
          value={input.fullName}
          name="fullName"
          onChange={(e) => setInput({ ...input, fullName: e.target.value })}
          placeholder="Enter Full Name"
          className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none"
        />

   
        <textarea
          value={input.bio}
          onChange={(e) => setInput({ ...input, bio: e.target.value })}
          placeholder="Short Bio (max 150 chars)"
          maxLength={150}
          name="bio"
          className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none resize-none"
        ></textarea>

      
        <select
          value={input.gender}
          name="gender"
          onChange={(e) => setInput({ ...input, gender: e.target.value })}
          className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none"
        >
          <option value="" disabled>
            Select Gender
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <div className="text-center flex justify-between">
          <button
            onClick={editProfileHandler}
            disabled={loading}
            className={`w-[46%] py-2 rounded-lg font-semibold transition ${
              loading
                ? "bg-pink-500 opacity-70 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
          <button onClick={handleCancle} className="w-[46%] py-2 rounded-lg font-semibold transition bg-green-600">
            Cancle
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
