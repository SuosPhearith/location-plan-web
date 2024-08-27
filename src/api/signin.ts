import axios from "axios";
//::==>> get base url from .env
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export interface SignIn {
  email: string;
  password: string;
  userAgent: string;
}

export const signIn = async (data: SignIn): Promise<any> => {
  try {
    const res = await axios.post(`${baseUrl}/auth/signIn`, data);
    return res;
  } catch (error: any) {
    const errorMsg =
      (error as errorResponse)?.response?.data?.message ??
      "An unexpected error occurred";
    throw errorMsg;
  }
};

export type errorResponse = {
  response: {
    data: {
      message: string;
      statusCode: number;
    };
  };
};
