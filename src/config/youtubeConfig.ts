import axios, { AxiosRequestConfig, AxiosInstance } from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export const youtubeRegex = /(youtub?e?\.[becom]{2,3}\/)(watch\?v=)?([\d\w]+)/;

const youtubeConfig: AxiosRequestConfig = {
  baseURL: `https://www.googleapis.com/youtube/v3`,
};

export const youtubeAPI: AxiosInstance = axios.create(youtubeConfig);

