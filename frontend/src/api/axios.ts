import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/refresh-token`,
        { refreshToken }
      );

      accessToken = res.data.accessToken;
      err.config.headers.Authorization = `Bearer ${accessToken}`;

      return axios(err.config);
    }
    return Promise.reject(err);
  }
);

export default api;
