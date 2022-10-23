import { TwitterLink, YoutubeLink } from "../src/models/fetch/SocialMedia";
import { twitterRegex } from "../src/config/twitterConfig";
import { youtubeRegex } from "../src/config/youtubeConfig";
import { tweetMockData, youtubeVideoMockData } from "./mockData";

describe("Social media module", () => {

  it("Twitter link correct", async () => {
    const twitterTestString = "https://twitter.com/DuffieldJesse/status/1549690832563097602";
    const regexResult: RegExpExecArray | null = twitterRegex.exec(twitterTestString);
    if (!regexResult) return
    const twitterLink = new TwitterLink(regexResult);
    const spy = jest
      .spyOn(twitterLink, "fetchTweet")
      .mockImplementation(async () => tweetMockData)
    const response = await twitterLink.getMessage();
    const expected = "[Jesse Duffield@DuffieldJesse] New Lazygit release in stores now! https://t.co/tfgU5rtT2R";
    expect(response).toBe(expected)
    spy.mockRestore()
  })

  it("YouTube link correct", async () => {
    const youtubeTestString = "https://www.youtube.com/watch?v=zwGQgc27vSc";
    const regexResult: RegExpExecArray | null = youtubeRegex.exec(youtubeTestString);
    if (!regexResult) return
    const youtubeLink = new YoutubeLink(regexResult);
    const spy = jest
      .spyOn(youtubeLink, "fetchVideos")
      .mockImplementation(async () => youtubeVideoMockData)
    const response: string = await youtubeLink.getMessage();
    const expected = "John Walker | Broken [03:19 - 99% - 335.6K]";
    expect(response).toBe(expected)
    spy.mockRestore()
  });

})