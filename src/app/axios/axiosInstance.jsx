"use client";
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const token = localStorage.getItem("accessToken");

instance.interceptors.request.use(
  (config) => {
    // Set headers before each request is sent
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // Handle request errors
  }
);

export default instance;
