import { create } from "zustand";
import axios from "axios";
import "dotenv";

let url =
  process.env.NODE_ENV === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: false,

  signup: async (username, email, password, linkedIN) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${url}/api/auth/register`, {
        username,
        email,
        password,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.error || "Erro ao criar conta",
        isLoading: false,
      });
      throw error;
    }
  },

  verify_email: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${url}/api/auth/verifyemail`, {
        code,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.error || "Erro ao verificar email",
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${url}/api/auth/login`, {
        email,
        password,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.error || "Erro ao fazer login",
        isLoading: false,
      });
      throw error;
    }
  }
}));

export default useAuthStore;
