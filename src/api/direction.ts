import apiRequest from "@/services/apiRequest";

export interface ResponseAll {
  data: Direction[];
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface Direction {
  id?: number;
  group?: string;
  note: string;
  file?: string;
  totalDirections?: number;
  totalRoutes?: number;
  createdAt?: string;
}

export interface CreateNewDirection {
  note: string;
  file: any;
}

export const getAllDirection = async (
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

    const res = await apiRequest("GET", `/direction?${params.toString()}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const createDirection = async (data: CreateNewDirection) => {
  try {
    const { note, file } = data;

    // Create FormData object and append data
    const formData = new FormData();
    formData.append("note", note);
    formData.append("file", file[0]);

    // Make API request with FormData
    return await apiRequest("POST", "/direction", formData);
  } catch (error) {
    throw error;
  }
};

export const deleteDirection = async (id: number) => {
  try {
    const res = await apiRequest("DELETE", `/direction/${id}`);
    return res;
  } catch (error) {
    throw error;
  }
};
