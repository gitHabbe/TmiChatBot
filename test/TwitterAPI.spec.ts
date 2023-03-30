import { AxiosConfig, AxiosFetch } from "./YouTubeAPI.spec";
import { ITwitterTweetResponse } from "../src/interfaces/socialMedia";
import { tweetMockData } from "./__mocks__/socialMediaMock"

class TwitterApi<T> implements AxiosFetch<T> {
    readonly baseURL = "https://api.twitter.com/2"
    private query: string = ""
    public api = new AxiosConfig()

    setTweetId(id: string) {
        const queryFields = `expansions=author_id&user.fields=name,username,verified&tweet.fields=public_metrics,created_at`
        this.query = `/tweets/${id}?${queryFields}`
    }

    async fetch(): Promise<T> {
        this.api.config.baseURL = this.baseURL
        const api = this.api.axiosInstance
        const { data } = await api.get<T>(this.query)
        return data
    }
}

describe("Test TwitterApi", () => {

    it("Init TwitterApi", async () => {
        const twitterApi = new TwitterApi<ITwitterTweetResponse>()
        twitterApi.setTweetId("1")
        const spy = jest
          .spyOn(twitterApi, "fetch")
          .mockImplementation(async () => tweetMockData)
        const twitterResponse = await twitterApi.fetch()
        const response = twitterResponse.data.text
        const expected = "New Lazygit release in stores now! https://t.co/tfgU5rtT2R";
        expect(response).toBe(expected)
        spy.mockRestore()
    })

})