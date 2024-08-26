import axios from "axios";
import { clearToken, getRefreshToken } from "./saveToken";
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const logoutAPI = async () => {
  try {
    await axios.post(`${baseUrl}//keycloak/auth/logout`, {
      token: getRefreshToken,
    });
    window.location.href = "/auth/signin";
    clearToken();
  } catch (error) {
    window.location.href = "/auth/signin";
  }
};

export default logoutAPI;
