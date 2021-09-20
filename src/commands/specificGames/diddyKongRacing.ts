import { Runner } from ".prisma/client";
import { dkr64API } from "../../config/speedrunConfig";
import { ITimeTrialResponse, ITrack } from "../../interfaces/specificGames";
import {
  ILeaderboardReponse,
  InduvidualLevelSupport,
  IRun,
} from "../../interfaces/speedrun";
import { IAxiosOptions, SpeedrunCom } from "../../models/axiosFetch";
import { RunnerPrisma } from "../../models/database/RunnerPrisma";
import { JsonLevels, JsonTimeTrials } from "../../models/JsonArrayFile";
import {
  datesDaysDifference,
  floatToHHMMSS,
  stringFloatToHHMMSSmm,
} from "../../utility/dateFormat";
import { fuseSearch } from "../../utility/fusejs";

/**
 * I don't know how to make this better.
 * Send help!
 * @param messageArray string[]
 * @returns { string[], ITrack[] }
 */
const filterDiddyKongRacingQueryAndLevels = (messageArray: string[]) => {
  const fileJson: JsonLevels = new JsonLevels();
  let dkrLevels: ITrack[] = fileJson.data();
  const vehicles = ["car", "hover", "plane"];
  let query: string[] = messageArray.slice(1);
  const specifiedVehicle = query.find((word: string) => {
    return vehicles.includes(word);
  });
  if (specifiedVehicle) {
    query = query.filter((word: string) => word !== specifiedVehicle);
    dkrLevels = dkrLevels.filter((track: ITrack) => {
      return track.vehicle === specifiedVehicle;
    });
  } else {
    dkrLevels = dkrLevels.filter((track: ITrack) => {
      return track.default;
    });
  }
  const isAbbreviated = dkrLevels.filter((track: ITrack) => {
    return query.includes(track.abbreviation);
  });
  if (isAbbreviated.length > 0) {
    query = [isAbbreviated[0].name];
    dkrLevels = isAbbreviated;
  }

  return { query, dkrLevels };
};

export const DiddyKongRacingInduvidualWorldRecord = async (
  messageArray: string[]
) => {
  const { query, dkrLevels } =
    filterDiddyKongRacingQueryAndLevels(messageArray);
  const [{ item }] = fuseSearch<ITrack>(dkrLevels, query.join(" "));
  const { name, vehicle, id } = item;
  const categoryId = "ndx0q5dq";
  const options: IAxiosOptions = {
    type: "Leaderboard",
    name: name,
    url: `leaderboards/9dow9e1p/level/${id}/${categoryId}?top=1`,
  };
  const speedrunCom = new SpeedrunCom<ILeaderboardReponse>(options);
  const {
    data: { data: leaderboard },
  } = await speedrunCom.fetchAPI();
  const worldRecordNumber: number = leaderboard.runs[0].run.times.primary_t;
  const worldRecordTime: string = floatToHHMMSS(worldRecordNumber);
  const worldRecordDate: string = leaderboard.runs[0].run.date;
  const runnerId: string = leaderboard.runs[0].run.players[0].id;
  const runnerPrisma = new RunnerPrisma();
  const runner: Runner = await runnerPrisma.get(runnerId);
  const daysAgo: number = datesDaysDifference(worldRecordDate);

  return `${name} ${vehicle} WR: ${worldRecordTime} by ${runner.name} ${daysAgo} days ago`;
};

export const DiddyKongRacingInduvidualPersonalBest = async (
  messageArray: string[]
) => {
  const targetRunner = messageArray[0].toLowerCase();
  const { query, dkrLevels } = await filterDiddyKongRacingQueryAndLevels(
    messageArray
  );
  const [{ item }] = fuseSearch<ITrack>(dkrLevels, query.join(" "));
  const { name, vehicle, id } = item;
  const categoryId = "ndx0q5dq";
  // console.log("~ fuseHit", fuseHit.slice(0, 3));
  const options: IAxiosOptions = {
    type: "Leaderboard",
    name: "Induvidual level",
    url: `leaderboards/9dow9e1p/level/${id}/${categoryId}`,
  };
  const speedrunCom = new SpeedrunCom<ILeaderboardReponse>(options);
  const {
    data: { data: leaderboardRes },
  } = await speedrunCom.fetchAPI();
  const runnerPrisma: RunnerPrisma = new RunnerPrisma();
  const runner: Runner = await runnerPrisma.get(targetRunner);
  const personalBest = leaderboardRes.runs.find((run: IRun) => {
    return run.run.players[0].id === runner.id;
  });
  if (!personalBest)
    throw new Error(`PB not found for ${runner.name} in ${name}`);
  const personalBestTime: string = floatToHHMMSS(
    personalBest.run.times.primary_t
  );
  console.log("~ personalBestTime", personalBestTime);

  return `${runner.name} ${name} ${vehicle} PB: ${personalBestTime} by ${runner.name}`;
};

const filterDiddyKongRacingTimeTrial = async (messageArray: string[]) => {
  const targetVehicle = messageArray[2];
  const jsonTimeTrials = new JsonTimeTrials();
  let vehicle = "",
    laps = "3",
    shortcut = false;
  let tracks = jsonTimeTrials.data();
  let filteredMessage = messageArray
    .filter((word) => {
      if (parseInt(word) === 1) laps = "1";
      return parseInt(word) !== 1;
    })
    .filter((word) => {
      const shortcutKeywords = ["shortcut", "short", "sc"];
      if (shortcutKeywords.includes(word)) shortcut = true;
      return !shortcutKeywords.includes(word);
    })
    .filter((word) => {
      const vehicles = ["CAR", "HOVER", "PLANE"];
      if (vehicles.includes(word.toUpperCase())) vehicle = word;
      return !vehicles.includes(word.toUpperCase());
    })
    .filter((word) => {
      return word !== "3";
    });
  const trackQuery = filteredMessage.slice(1).join(" ");
  console.log("~ filteredMessage", filteredMessage);
  // const targetLevel = filteredMessage[1];
  tracks = tracks.filter((track) => {
    return track.abbreviation === trackQuery;
  });
  if (tracks.length === 0) tracks = jsonTimeTrials.data();
  if (vehicle) {
    tracks = tracks.filter((track) => {
      return track.vehicle === vehicle;
    });
  } else {
    tracks = tracks.filter((track) => {
      return track.default === true;
    });
  }
  console.log("~ trackQuery", trackQuery);
  console.log("~ laps", laps);
  console.log("~ shortcut", shortcut);
  console.log("~ vehicle", vehicle);
  console.log("~ tracks", tracks.length, tracks.slice(0, 3));
  const trackType = shortcut ? "shortcut" : "standard";
  const fuseHit = fuseSearch<ITrack>(tracks, trackQuery);

  return { fuseHit: fuseHit[0], laps, trackType };
};

export const DiddyKongRacingTimeTrialWorldRecord = async (
  messageArray: string[]
) => {
  const { fuseHit, laps, trackType } = await filterDiddyKongRacingTimeTrial(
    messageArray
  );
  console.log("~ fuseHit, laps, trackType", fuseHit, laps, trackType);
  const { vehicle, name } = fuseHit.item;
  console.log("~ vehicle, name", vehicle, name);
  console.log(
    `&track=${name}&vehicle=${vehicle}&laps=${laps}&type=${trackType}`
  );

  const worldRecoard = await dkr64API.get<ITimeTrialResponse>(
    `/world_record?api_token=${process.env.DKR64_API_TOKEN}&track=${name}&vehicle=${vehicle}&laps=${laps}&type=${trackType}`
  );
  console.log("~ worldRecoard", worldRecoard.data);
  const runner = worldRecoard.data.times[0].username;
  let time = worldRecoard.data.times[0].time_value;
  console.log("parseFloat(time):", parseFloat(time).toFixed(2));
  time = stringFloatToHHMMSSmm(time);
  const track = name
    .split("-")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
  const formalVehicle = vehicle.charAt(0).toUpperCase() + vehicle.slice(1);
  const shortcut = trackType === "shortcut" ? "[Shortcut]" : "";

  return `${track} [${formalVehicle}][${laps}-lap]${shortcut} WR: ${time} by ${runner}`;
};

export const DiddyKongRacingTimeTrialPersonalBest = async (
  messageArray: string[]
) => {
  const { fuseHit, laps, trackType } = await filterDiddyKongRacingTimeTrial(
    messageArray.slice(1)
  );
  const { vehicle, name } = fuseHit.item;
  const runner = messageArray[0];
  console.log("~ runner", runner);
  const personalBest = await dkr64API.get<ITimeTrialResponse>(
    `/times?api_token=${process.env.DKR64_API_TOKEN}&track=${name}&vehicle=${vehicle}&laps=${laps}&type=${trackType}&user=${runner}`
  );
  const run = personalBest.data.times.find((run) => {
    console.log("run.username.toUpperCase():", run.username.toUpperCase());
    return run.username.toUpperCase() === runner.toUpperCase();
  });
  if (!run) throw new Error(`Cant find run`);
  let time = run.time_value;
  console.log("parseFloat(time):", parseFloat(time).toFixed(2));
  time = stringFloatToHHMMSSmm(time);
  const track = name
    .split("-")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
  const formalVehicle = vehicle.charAt(0).toUpperCase() + vehicle.slice(1);
  const shortcut = trackType === "shortcut" ? "[Shortcut]" : "";

  return `${runner} ${track} [${formalVehicle}][${laps}-lap]${shortcut} PB: ${time}`;
};
