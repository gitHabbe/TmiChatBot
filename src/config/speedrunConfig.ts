import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const speedrunConfig: AxiosRequestConfig = {
  baseURL: `https://www.speedrun.com/api/v1`,
};

export const speedrunAPI: AxiosInstance = axios.create(speedrunConfig);
