import axios, { AxiosRequestConfig, AxiosInstance } from "axios";

const bulbapediaConfig: AxiosRequestConfig = {
    baseURL: `https://bulbapedia.bulbagarden.net/`,
};

export const bulbapediaAPI: AxiosInstance = axios.create(bulbapediaConfig);
