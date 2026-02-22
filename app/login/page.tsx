"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/app/assests/login.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import loginimage from "@/app/assests/image p.jpg"


export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/auth/login/", form);

      if (res.data.success) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err.response?.data);
      alert("Login failed");
    }
  };

  return (
    <div className="container-fluid login-page">
      <div className="row min-vh-100">


        <div className="col-md-6 login-image-section d-flex justify-content-center align-items-center">
          <img
            src={loginimage.src}
            alt="Login Illustration"
            className="img-fluid login-image"
          />
        </div>


        <div className="col-md-6 d-flex justify-content-center align-items-center">
          <div className="login-card shadow-lg">

            <h2 className="login-title mb-4">
              Log in to your account
            </h2>

            <div className="mb-3">
              <input
                className="form-control"
                type="email"
                placeholder="Enter Email"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>


            <div className="mb-3 password-wrapper">
              <input
                className="form-control password-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />

              <i
                className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"
                  } password-eye`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>


            <button
              className="login-button w-100"
              onClick={handleLogin}
            >
              Login
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
