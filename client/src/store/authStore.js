import { create } from "zustand";
import axios from "axios";
import "dotenv";

let url =
  process.env.NODE_ENV === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  userType: null,
  error: null,
  isLoading: false,
  isCheckingAuth: false,
  userPrimeiroLogin: false,

  signup: async (USERNAME, NOME, EMAIL) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${url}/api/auth/register`,
        {
          USERNAME,
          NOME,
          EMAIL,
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

  login: async (EMAIL, PASSWORD) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${url}/api/auth/login`,
        {
          EMAIL,
          PASSWORD,
        },
        { withCredentials: true }
      );
      set({
        user: response.data.user,
        userType: response.data.user.perfil,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        userPrimeiroLogin: response.data.user.primeiroLogin,
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
      const response = await axios.get(`${url}/api/auth/checkauth`, {
        withCredentials: true,
      });
      set({
        user: response.data.user,
        userType: response.data.user.perfil,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      //console.log("Erro ao verificar autenticação:", error);
      set({
        error: null,
        isCheckingAuth: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  resetPassword: async (token, PASSWORD) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${url}/api/auth/resetpassword/${token}`,
        {
          PASSWORD,
        }
      );
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.error || "Erro ao redefinir a password",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.get(`${url}/api/auth/logout`, { withCredentials: true });
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.error || "Erro ao fazer logout",
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useAuthStore;
