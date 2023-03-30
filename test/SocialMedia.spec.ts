import { TwitterLink, YoutubeLink } from "../src/models/fetch/SocialMedia";
import { twitterRegex } from "../src/config/twitterConfig";
import { youtubeRegex } from "../src/config/youtubeConfig";
import { tweetMockData, youtubeVideosMock } from "./__mocks__/socialMediaMock"

describe("Social media module", () => {

  it("Twitter link correct", async () => {
    const twitterTestString = "https://twitter.com/DuffieldJesse/status/1549690832563097602";
    const regexResult: RegExpExecArray | null = twitterRegex.exec(twitterTestString);
    if (!regexResult) return
    const twitterLink = new TwitterLink(regexResult);
    const spy = mockTweet(twitterLink);
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
    const spy = mockYoutubeVideo(youtubeLink);
    const response: string = await youtubeLink.getMessage();
    const expected = "John Walker | Broken [03:19 - 9.9K👍 - 335.6K]";
    expect(response).toBe(expected)
    spy.mockRestore()
  });

  function mockYoutubeVideo(youtubeLink: YoutubeLink) {
    return jest
        .spyOn(youtubeLink, "fetchVideos")
        .mockReturnValue(Promise.resolve(youtubeVideosMock))
  }

  function mockTweet(twitterLink: TwitterLink) {
    return jest
        .spyOn(twitterLink, "fetchTweet")
        .mockReturnValue(Promise.resolve(tweetMockData))
  }
})
