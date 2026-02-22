"use server";

import { createAxiosInstance } from "./axiosInstance";

export const useCallApi = async (
  url: string,
  method: "GET" | "POST",
  data?: any
) => {
  const axiosInstance = await createAxiosInstance();

  const response =
    method === "GET"
      ? await axiosInstance.get(url)
      : await axiosInstance.post(url, data || {});

  return {
    success: true,
    data: response.data,
  };
};