import axios from "axios";
import { clearToken, getRefreshToken } from "./saveToken";
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const logoutAPI = async () => {
  try {
    await axios.post(`${baseUrl}/auth/logout`, {
      token: getRefreshToken,
    });
    window.location.href = "/en/auth/signin";
    clearToken();
  } catch (error) {
    window.location.href = "/en/auth/signin";
  }
};

export default logoutAPI;
