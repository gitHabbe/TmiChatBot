import { youtubeAPI } from "../config/youtubeConfig";
import { IYoutubeItem, IYoutubePagination } from "../interfaces/socialMedia";

export const youtubeInfo = async (youtube_hit: RegExpExecArray) => {
  const youtube_id = youtube_hit[3];
  const { data: youtube_pagination } = await youtubeAPI.get<IYoutubePagination>(
    `/videos?id=${youtube_id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics,status`
  );
  console.log("youtube_video:", youtube_pagination.items[0].contentDetails);
  const video = youtube_pagination.items[0];
  const { viewCount, likeCount, dislikeCount } = video.statistics;
  // console.log("youtube_video:", youtube_video.data.items);
  const likePercent = Math.round(
    (parseInt(likeCount) / (parseInt(likeCount) + parseInt(dislikeCount))) * 100
  );
  const duration = video.contentDetails.duration;
  const title = video.snippet.title;
  return `${title} [⌛ ${duration} 👍 ${likePercent}% 📺 ${viewCount}]`;
  return "asdf";
};
