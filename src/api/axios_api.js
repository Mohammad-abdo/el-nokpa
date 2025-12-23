import axios from "axios";

const api = axios.create({
  baseURL: "https://polivar.teamqeematech.site/api", // غيّرها حسب الـ Base URL في Postman
  // baseURL: ""https://polivar.teamqeematech.site/api", // غيّرها حسب الـ Base URL في Postman
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
// ==================== AUTH ENDPOINTS ====================
export const authAPI = {
  // Login
  login: (email, password) => {
    console.log(
      "📤 Sending login request to:",
      ""https://polivar.teamqeematech.site/api/login"
    );
    return api.post("login", { email, password });
  },

  // Register with FormData (supports file upload)
  register: (formData) => {
    console.log(
      "📤 Sending register request to:",
      ""https://polivar.teamqeematech.site/api/register"
    );
    return api.post("register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Logout
  logout: () => {
    return api.post("logout");
  },

  // Get User Profile
  getProfile: () => {
    return api.get("user");
  },

  // Send Verification Code
  sendVerificationCode: () => {
    return api.post("send-verification-code");
  },

  // Verify Email
  verifyEmail: (code) => {
    const formData = new FormData();
    formData.append("code", code);
    return api.post("verify-code", formData);
  },

  // Forgot Password
  forgotPassword: (email) => {
    const formData = new FormData();
    formData.append("email", email);
    return api.post("forgot-password", formData, {
      headers: { Authorization: "" },
    });
  },

  // Reset Password
  resetPassword: (email, otp, password, re_password) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("otp", otp);
    formData.append("password", password);
    formData.append("re_password", re_password);
    return api.post("reset-password", formData, {
      headers: { Authorization: "" },
    });
  },

  // Delete Account
  deleteAccount: () => {
    return api.delete("delete-account");
  },
};
export default api;
