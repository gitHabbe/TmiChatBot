import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
// import * as dotenv from "dotenv";

// dotenv.config();

const speedrunConfig: AxiosRequestConfig = {
  baseURL: `https://www.speedrun.com/api/v1`,
};

const dkr64Config: AxiosRequestConfig = {
  baseURL: `https://www.dkr64.com/api`,
};

export const speedrunAPI: AxiosInstance = axios.create(speedrunConfig);
export const dkr64API: AxiosInstance = axios.create(dkr64Config);
