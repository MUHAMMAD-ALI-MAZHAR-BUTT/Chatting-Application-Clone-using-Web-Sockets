"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

export default function Auth() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [isSignup, setIsSignup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    isSignup ? handleSubmitSignup() : handleSubmitSignin();
  };

  const handleSubmitSignup = async () => {
    const { email, username, password } = formData;
    // Validate email, username, and password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errorsCopy = { ...errors };
    if (!emailRegex.test(email)) {
      errorsCopy.email = "Invalid email address";
    } else {
      errorsCopy.email = "";
    }
    if (username.length < 3) {
      errorsCopy.username = "Username must be at least 3 characters long";
    } else {
      errorsCopy.username = "";
    }
    if (password.length < 6) {
      errorsCopy.password = "Password must be at least 6 characters long";
    } else {
      errorsCopy.password = "";
    }
    setErrors(errorsCopy);
    if (!errorsCopy.username && !errorsCopy.password) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}auth/register`,
          formData
        );

        if (response.status === 201) {
          const { accessToken } = response.data;
          if (accessToken) {
            localStorage.setItem("accessToken", accessToken); // Save accessToken to localStorage
            toast.success("SignUp Successful");
            router.push("/dashboard");
          } else {
            toast.error("Signup Unsuccessful");
          }
        }
      } catch (error) {
        console.error("Error registering user:", error);
        toast.error("An error occurred during signup");
      }
    }
  };

  const handleSubmitSignin = async () => {
    const { username, password } = formData;
    const errorsCopy = { ...errors };
    // Validate username and password
    if (username.length < 3) {
      errorsCopy.username = "Username must be at least 3 characters long";
    } else {
      errorsCopy.username = "";
    }

    setErrors(errorsCopy);

    if (!errorsCopy.username && !errorsCopy.password) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}auth/login`,
          {
            username,
            password,
          }
        );

        if (response.status === 201) {
          const { accessToken } = response.data;
          if (accessToken) {
            localStorage.setItem("accessToken", accessToken); // Save accessToken to localStorage
            toast.success("Signin Successful");
            router.push("/dashboard");
          } else {
            toast.error("Signin Unsuccessful");
          }
        } else {
          toast.error("Signin Unsuccessful");
        }
      } catch (error) {
        console.error("Error signing in:", error);
        toast.error("Signin Unsuccessful");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <div className="flex justify-center items-center mb-4">
          <button
            className={`px-4 py-2 mx-2 rounded ${
              isSignup ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
            }`}
            onClick={() => setIsSignup(true)}
          >
            Sign Up
          </button>
          <button
            className={`px-4 py-2 mx-2 rounded ${
              isSignup ? "bg-gray-300 text-gray-700" : "bg-blue-500 text-white"
            }`}
            onClick={() => setIsSignup(false)}
          >
            Sign In
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-4">
          {isSignup ? "Sign Up" : "Sign In"}
        </h2>
        <form>
          {isSignup && (
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded text-black  ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded text-black  ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border text-black rounded ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            onClick={handleSubmit}
          >
            {isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
