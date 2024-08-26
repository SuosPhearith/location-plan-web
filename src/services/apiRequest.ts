//::================================>>Third party<<=================================::
import axios from "axios";
//::================================================================================::

//::===============================>>Custom library<<===============================::
import {
  getAccessToken,
  getRefreshToken,
  getRole,
  saveToken,
} from "./saveToken";
import logoutAPI from "./logout";
import { errorResponse } from "@/types/error";
//::================================================================================::

//::==>> get base url from .env
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

//::==>> start core function
async function apiRequest(
  method: string,
  url: string,
  data = {},
  retry = false,
) {
  //:: validate
  const isRefreshToken = getRefreshToken();
  const isRole = getRole();
  if (!isRefreshToken || !isRole) {
    return logoutAPI();
  }
  //::==>> get accessToken from localstorage for make request
  let accessToken = getAccessToken();

  try {
    //::==>> create request using axios
    const response = await axios.request({
      //::==>> method for make request
      method,
      //::==>> connect baseUrl with url provided
      url: baseUrl + url,
      //::==>> get data
      data,
      headers: {
        //::==>> put token in header Bearer
        Authorization: `Bearer ${accessToken}`,
      },
    });

    //::==>> response back
    return response.data;
  } catch (error: any) {
    //::==>> if request error throw catch check status for apply refreshToken
    if (
      //::==>> if response status 401 and 403
      error?.response &&
      (error?.response?.status === 401 || error?.response?.status === 403)
    ) {
      //::==>> if this is the first attempt to refresh token
      if (!retry) {
        try {
          //::==>> call method refreshToken to implement
          await refreshToken();
          //::==>> make request again after restore token by refreshToken function
          return apiRequest(method, url, data, true);
        } catch (refreshError) {
          //::==>> logout from system
          logoutAPI();
        }
      } else {
        //::==>> if already tried refreshing token, logout
        logoutAPI();
      }
    } else {
      const errorMsg =
        (error as errorResponse)?.response?.data?.message ??
        "An unexpected error occurred";
      throw errorMsg;
    }
  }
}

async function refreshToken() {
  try {
    alert("Called refresh token");
    //::==>> make request to get new accessToken by using refreshToken
    const newToken = await axios.post(`${baseUrl}/keycloak/auth/refresh`, {
      //::==>> get refreshToken from localstorage
      token: getRefreshToken(),
    });
    //::==>> if response Ok we store new accessToken and new refreshToken
    saveToken(newToken.data.access_token, newToken.data.refresh_token);
  } catch (error) {
    //::==>> if throw error system will auto logout
    logoutAPI();
  }
}

export default apiRequest;
