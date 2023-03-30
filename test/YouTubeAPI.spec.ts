import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { IYoutubePagination } from "../src/interfaces/socialMedia";
import { youtubeVideosMock } from "./__mocks__/socialMediaMock"

interface APIConfig {
  config: AxiosRequestConfig;
  axiosInstance: AxiosInstance;
}

export class AxiosConfig implements APIConfig {
  config: AxiosRequestConfig = { baseURL: "" }
  axiosInstance: AxiosInstance = axios.create(this.config)
}

export interface AxiosFetch<T> {
  baseURL: string
  api: AxiosConfig

  fetch(): Promise<T>
}

class YouTubeApi<T> implements AxiosFetch<T> {
  private query = ""
  readonly baseURL = "https://www.googleapis.com/youtube/v3"
  public api = new AxiosConfig()

  setVideoId(id: string) {
    this.query = `/videos?id=${id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics,status`;
  }

  async fetch(): Promise<T> {
    this.api.config.baseURL = this.baseURL
    const api = this.api.axiosInstance;
    const { data: youtube_pagination } = await api.get<T>(this.query);
    return youtube_pagination
  }
}

describe("Test YouTubeApi", () => {

  it("Init YouTubeApi", async () => {
    const youTubeApi = new YouTubeApi<IYoutubePagination>()
    youTubeApi.setVideoId("1")
    const spy = jest
      .spyOn(youTubeApi, "fetch")
      .mockImplementation(async () => youtubeVideosMock)
    const video = await youTubeApi.fetch()
    const response = video.items[0].snippet.title
    const expected = "John Walker | Broken"
    expect(response).toBe(expected)
    spy.mockRestore()
  })

})