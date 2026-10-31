import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8080/api"
});

export const recommendationApi = axios.create({
    baseURL: import.meta.env.VITE_RECOMMENDATION_API_URL || "http://localhost:8000"
});

export default api;
