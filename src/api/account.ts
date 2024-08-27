import apiRequest from "@/services/apiRequest";

export interface User {
  id: number;
  name: string;
  email: string;
  gender: string;
  avatar: string;
  roleId: number;
  session: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getMe = async (): Promise<User> => {
  try {
    const me = await apiRequest("GET", "/auth/me");
    return me;
  } catch (error) {
    throw error;
  }
};

export interface FileUpload {
  file: File;
}

export const uploadAvatar = async (data: FileUpload) => {
  try {
    const formData = new FormData();
    formData.append("file", data.file);
    const response = await apiRequest("POST", "/auth/uploadAvatar", formData);
    return response;
  } catch (error) {
    throw error;
  }
};

export interface UpdateProfile {
  file?: File;
  name: string;
  email: string;
}

export const updateProfile = async (data: UpdateProfile): Promise<User> => {
  try {
    const response = await apiRequest("PATCH", "/auth/updateProfile", {
      name: data.name,
      email: data.email,
      gender: "male",
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePassword = async (data: ChangePassword) => {
  try {
    return await apiRequest("PATCH", "/auth/changePassword", data);
  } catch (error) {
    throw error;
  }
};

export interface Session {
  id: number;
  userId: number;
  sessionToken: string;
  device: string;
  browser: string;
  createdAt: string;
}

export interface UserSession {
  data: Session[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
export interface PageSize {
  pageSize: number;
}

export const getSession = async (data: PageSize): Promise<UserSession> => {
  try {
    return await apiRequest(
      "GET",
      `/auth/getSession/getAll?pageSize=${data.pageSize}`
    );
  } catch (error) {
    throw error;
  }
};

export const logoutAllDevices = async () => {
  try {
    return await apiRequest("PATCH", "/auth/account/logoutAllDevices");
  } catch (error) {
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    return await apiRequest("DELETE", "/auth/deleteAccount");
  } catch (error) {
    throw error;
  }
};
export const logoutDevice = async (sessionToken: string) => {
  try {
    return await apiRequest(
      "DELETE",
      `/auth/account/logoutDevice/${sessionToken}`
    );
  } catch (error) {
    throw error;
  }
};
