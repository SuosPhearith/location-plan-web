import apiRequest from "@/services/apiRequest";

export interface ResponseAll {
  data: User[];
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  status: boolean;
  avatar: string | null;
  gender: string;
  session: number;
  createdAt: string; // You may want to convert this to a Date type if you parse it into a Date object
  updatedAt: string; // Same as above
}

export interface CreateNewUser {
  name: string;
  email: string;
  password: string;
}

export const getAllUser = async (
  page: number,
  limit: number,
  query: string
): Promise<ResponseAll> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (query) {
      params.append("query", query);
    }

    const res = await apiRequest("GET", `/user?${params.toString()}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (data: CreateNewUser) => {
  try {
    return await apiRequest("POST", "/user", data);
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id: number) => {
  try {
    return await apiRequest("DELETE", `/user/${id}`);
  } catch (error) {
    throw error;
  }
};

export const toggleActive = async (id: number) => {
  try {
    return await apiRequest("PATCH", `/user/${id}/toggle-active`);
  } catch (error) {
    throw error;
  }
};

export interface Reset {
  id: number;
  newPassword: string;
}

export const resetPasswordUser = async (data: Reset) => {
  try {
    return await apiRequest("PATCH", `/user/${data.id}`, {
      newPassword: data.newPassword,
      confirmPassword: data.newPassword,
    });
  } catch (error) {
    throw error;
  }
};
