import axios, { AxiosRequestConfig, AxiosInstance } from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export const twitterRegex = /twitter.com\/.*\/status\/(\d+)/;

const twitterConfig: AxiosRequestConfig = {
  baseURL: `https://api.twitter.com/2`,
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
};

export const twitterAPI: AxiosInstance = axios.create(twitterConfig);
