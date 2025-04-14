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
      const response = await axios.post(
        `${url}/api/auth/register`,
        {
          username,
          email,
          password,
        },
        { withCredentials: true }
      );
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
      localStorage.setItem("accessToken", response.data.token);
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
      const response = await axios.post(
        `${url}/api/auth/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      localStorage.setItem("accessToken", response.data.token);
      console.log("Token recebido no login:", response.data.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      console.log("Usuário autenticado com sucesso:", response.data.user);
    } catch (error) {
      set({
        error: error.response?.data?.error || "Erro ao fazer login",
        isLoading: false,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        set({ isAuthenticated: false, isCheckingAuth: false, user: null });
        console.log("Token não encontrado, usuário não autenticado.");
        return;
      }
      console.log("Token encontrado:", token);
      const response = await axios.get(`${url}/api/auth/checkauth`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Resposta do servidor:", response.data);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      localStorage.removeItem("accessToken");
      console.log("Erro ao verificar autenticação:", error);
      set({
        error: null,
        isCheckingAuth: false,
        isAuthenticated: false,
      });
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${url}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem("accessToken");
      delete axios.defaults.headers.common["Authorization"];
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error.response?.data?.error || "Erro ao fazer logout",
        isLoading: false,
      });
    }
  },
}));

export default useAuthStore;
