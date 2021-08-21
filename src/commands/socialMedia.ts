import { youtubeAPI } from "../config/youtubeConfig";
import { IYoutubePagination } from "../interfaces/socialMedia";
import {
  numberToRoundedWithLetter,
  youtubeDurationToHHMMSS,
} from "../utility/dateFormat";

export const youtubeInfo = async (youtube_hit: RegExpExecArray) => {
  const youtube_id = youtube_hit[3];
  const { data: youtube_pagination } = await youtubeAPI.get<IYoutubePagination>(
    `/videos?id=${youtube_id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics,status`
  );
  const video = youtube_pagination.items[0];
  const { viewCount, likeCount, dislikeCount } = video.statistics;
  const likePercent = Math.round(
    (parseInt(likeCount) / (parseInt(likeCount) + parseInt(dislikeCount))) * 100
  );
  const duration = youtubeDurationToHHMMSS(video.contentDetails.duration);
  const views = numberToRoundedWithLetter(viewCount);
  const title = video.snippet.title;
  return `${title} [${duration} - ${likePercent}% - ${views}]`;
};
