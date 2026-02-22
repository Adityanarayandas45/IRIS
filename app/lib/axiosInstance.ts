
"use server";

import axios from "axios";
import { headers } from "next/headers";

const BASE_URL = "https://admin.devp2.iris26.variableq.com";

export const createAxiosInstance = async () => {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") || "";

  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      Cookie: cookieHeader,
    },
    withCredentials: true,
  });
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
  
      if (
        (error.response?.status === 401 ||
          error.response?.status === 403) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
  
        console.log("401/403 detected. Calling refresh...");
  
        const headerStore = await headers();
        const cookieHeader = headerStore.get("cookie") || "";
  
        // const refreshRes = await fetch(
        //   "http://localhost:3000/api/auth/refresh",
        //   {
        //     method: "POST",
        //     headers: { Cookie: cookieHeader },
        //   }
        // );
        const refreshRes = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/refresh`,
          {
            method: "POST",
            headers: {
              Cookie: cookieHeader,
            },
          }
        );
        if (!refreshRes.ok) {
          throw new Error("Refresh failed");
        }
  
 
        const newSetCookie =
          refreshRes.headers.get("set-cookie");
  
        if (newSetCookie) {
          originalRequest.headers["Cookie"] =
            newSetCookie.split(";")[0];
        }
  
        console.log("Retrying with updated cookie...");
  
        return axios(originalRequest);
      }
  
      return Promise.reject(error);
    }
  );
  return instance;
};