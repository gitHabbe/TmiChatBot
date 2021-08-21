import axios, { AxiosRequestConfig, AxiosInstance } from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export const youtubeRegexBackup: RegExp =
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)[\w\=]*)?/;

export const youtubeRegex = /(youtub?e?\.[becom]{2,3}\/)(watch\?v=)?([\d\w]+)/;
// (youtub?e?\.[becom]{2,3}\/)
// (youtub?e?\.[becom]{2,3}\/)

const youtubeConfig: AxiosRequestConfig = {
  // https://www.googleapis.com/youtube/v3/videos?id=${yt_id}&key=${process.env.YT_API_KEY}&part=snippet,contentDetails,statistics,status
  baseURL: `https://www.googleapis.com/youtube/v3`,
};

export const youtubeAPI: AxiosInstance = axios.create(youtubeConfig);
