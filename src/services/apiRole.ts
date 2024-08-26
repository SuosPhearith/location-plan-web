import { getRefreshToken } from "./saveToken";
import apiRequest from "./apiRequest";
const apiRole = async () => {
  try {
    const response = await apiRequest("POST", "/keycloak/auth/introspect", {
      token: getRefreshToken(),
    });
    if (!response.role) {
      window.location.href = "/auth/signin";
    }
    return response.role;
  } catch (error) {
    window.location.href = "/auth/signin";
  }
};

export default apiRole;
