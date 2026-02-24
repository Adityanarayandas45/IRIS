
"use server";

import axios from "axios";
import { cookies, headers } from "next/headers";

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
          "https://admin.devp2.iris26.variableq.com/auth/refresh/",
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


        // const newSetCookie = refreshRes.headers.get("set-cookie");

        // if (newSetCookie) {
        //   const cookiesArray = newSetCookie.split(/,(?=\s*\w+=)/);

        //   let accessToken = "";
        //   let refreshToken = "";

        //   cookiesArray.forEach((cookie) => {
        //     if (cookie.includes("access_token")) {
        //       accessToken = cookie.split(";")[0];
        //     }
        //     if (cookie.includes("refresh_token")) {
        //       refreshToken = cookie.split(";")[0];
        //     }
        //   });


        //   const updatedCookie = [accessToken, refreshToken]
        //     .filter(Boolean)
        //     .join("; ");

        //   if (updatedCookie) {
        //     originalRequest.headers["Cookie"] = updatedCookie;
        //   }
        // }
        const setCookieHeader = refreshRes.headers.get("set-cookie");

        if (setCookieHeader) {
          const cookieStore = await cookies();

          const cookiesArray = setCookieHeader.split(/,(?=\s*\w+=)/);

          let updatedCookies: string[] = [];

          cookiesArray.forEach((cookieStr) => {
            const [cookiePart] = cookieStr.split(";");
            const [name, value] = cookiePart.split("=");

           
            cookieStore.set({
              name,
              value,
              httpOnly: true,
              path: "/",
              secure: false,
              sameSite: "lax",
            });

            
            updatedCookies.push(`${name}=${value}`);
          });

        
          originalRequest.headers["Cookie"] = updatedCookies.join("; ");

          console.log("Cookies saved to browser and request updated");
        }
        return axios(originalRequest);
      }

      return Promise.reject(error);
    }
  );
  return instance;
};