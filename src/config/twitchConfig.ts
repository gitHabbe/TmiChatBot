import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from "axios";
import * as dotenv from "dotenv";

const twitchConfig: AxiosRequestConfig = {
  baseURL: `https://api.twitch.tv/helix`,
  headers: {
    "Client-Id": process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${process.env.TWITCH_OAUTH_PASSWORD}`,
  },
};

export const twitchInstance: AxiosInstance = axios.create(twitchConfig);
