const saveTokenAndRole = (
  accessToken: string,
  refreshToken: string,
  role: string,
) => {
  window.localStorage.setItem("accessToken", accessToken);
  window.localStorage.setItem("refreshToken", refreshToken);
  window.localStorage.setItem("role", role);
};

export const saveToken = (accessToken: string, refreshToken: string) => {
  window.localStorage.setItem("accessToken", accessToken);
  window.localStorage.setItem("refreshToken", refreshToken);
};

export const clearToken = () => {
  window.localStorage.clear();
};

export const getAccessToken = () => {
  return window.localStorage.getItem("accessToken");
};

export const getRefreshToken = () => {
  return window.localStorage.getItem("refreshToken");
};

export const getRole = () => {
  return window.localStorage.getItem("role");
};

export type Roles = {
  ADMIN: "ADMIN";
  MANAGER: "MANAGER";
  DRIVER: "DRIVER";
  ASSISTANT: "ASSISTANT";
};

export default saveTokenAndRole;
