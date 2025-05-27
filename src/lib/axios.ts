import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.API_URL || "http://172.29.0.2:3000",
  headers: {
    "Content-Type": "application/json",
  },
});


export default api;
