import api from "@/api/axios";
import useAuthStore from "../../features/auth/authStore.js";


export const signUpUser = async (data) => {
  const response = await api.post("/user/create", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/login", data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/user/me");
  return response.data;
};

export const logoutUser = async () => {
  const refreshToken = useAuthStore.getState().refreshToken;
  console.log("Logging out with refresh token:", refreshToken); 
  return api.post(
    "/logout",
    {},
    {
      headers: {
        "X-REFRESH-TOKEN": refreshToken,
      },
      withCredentials: true,
    }
  );
};
