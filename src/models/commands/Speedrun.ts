import { Runner } from ".prisma/client";
import { dkr64API, speedrunAPI } from "../../config/speedrunConfig";
import { ITimeTrialJson, ITimeTrialResponse, ITrack } from "../../interfaces/specificGames";
import { ILeaderboardResponse, } from "../../interfaces/speedrun";
import { datesDaysDifference, floatToHHMMSS } from "../../utility/dateFormat";
import { fuseSearch } from "../../utility/fusejs";
import { RunnerPrisma } from "../database/RunnerPrisma";
import { Api, TimeTrialPersonalBestApi, TimeTrialWorldRecordApi, WorldRecordApi } from "../fetch/SpeedrunCom";
import { JsonTimeTrials } from "../JsonArrayFile";
import { ICommand } from "../../interfaces/Command";
import { ParseMessage } from "../../utility/ParseMessage";
import { MessageData } from "../tmi/MessageData";

export class IndividualWorldRecordDiddyKongRacing extends ParseMessage implements ICommand {

    constructor(public messageData: MessageData) {super(messageData);}

    async run(): Promise<MessageData> {
        const { query, dkrLevels } = this.parseMessage();
        const [ { item } ] = fuseSearch<ITrack>(dkrLevels, query.join(" "));
        const apiLeaderboard = new Api<ILeaderboardResponse>(speedrunAPI);
        const leaderboardApi = new WorldRecordApi(apiLeaderboard, item);
        const { data: leaderboard } = await leaderboardApi.fetch();
        const { name, vehicle } = item;
        const worldRecordNumber: number = leaderboard.runs[0].run.times.primary_t;
        const worldRecordTime: string = floatToHHMMSS(worldRecordNumber);
        const worldRecordDate: string = leaderboard.runs[0].run.date;
        const runnerId: string = leaderboard.runs[0].run.players[0].id;
        const runnerPrisma = new RunnerPrisma();
        const runner: Runner = await runnerPrisma.get(runnerId);
        const daysAgo: number = datesDaysDifference(worldRecordDate);
        this.messageData.response = `${name} ${vehicle} WR: ${worldRecordTime} by ${runner.name} - ${daysAgo} days ago`;

        return this.messageData;
    };
}


export class TimeTrialWorldRecordDiddyKongRacing implements ICommand {
    private jsonTimeTrials = new JsonTimeTrials();

    constructor(public messageData: MessageData) {
    }

    parseMessage = () => {
        const { message } = this.messageData;
        let query = message.split(" ").slice(2);
        let tracks = this.jsonTimeTrials.data()
        let laps = "3";
        let isShortcut = false
        let vehicle: string;
        let filteredMessage = message.split(" ").slice(2)
            .filter((word: string) => {
                if (parseInt(word) === 1) laps = "1";
                return parseInt(word) !== 1;
            })
            .filter((word: string) => {
                const shortcutKeywords = [ "shortcut", "short", "sc" ];
                if (shortcutKeywords.includes(word)) isShortcut = true;
                return !shortcutKeywords.includes(word);
            })
            .filter((word: string) => {
                const vehicles = [ "CAR", "HOVER", "PLANE" ];
                if (vehicles.includes(word.toUpperCase())) {
                    vehicle = word;
                    tracks = tracks.filter((track: ITimeTrialJson) => {
                        return track.vehicle.toLowerCase() === vehicle.toLowerCase()
                    })
                }
                return !vehicles.includes(word.toUpperCase());
            })
            .filter((word: string) => {
                return word !== "3";
            });
        const trackQuery = filteredMessage.join(" ");
        console.log("filteredMessage:", filteredMessage)
        if (tracks.length === 0) tracks = this.jsonTimeTrials.data();
        // console.log("tracks:", tracks)
        console.log("trackQuery:", trackQuery)

        return { query: filteredMessage, dkrLevels: tracks, isShortcut, laps };
    };

    run = async () => {
        const { query, dkrLevels, isShortcut, laps } = this.parseMessage();
        let shortcut = "standard"
        if (isShortcut) shortcut = "shortcut"
        const [ { item } ] = fuseSearch<ITimeTrialJson>(dkrLevels, query.join(" "));
        const apiTimeTrialWorldRecord = new Api<ITimeTrialResponse>(dkr64API);
        const worldRecordApi = new TimeTrialWorldRecordApi(apiTimeTrialWorldRecord, item, laps, shortcut);
        const res = await worldRecordApi.fetch()
        const track = item.name
            .split("-")
            .map((word) => {
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(" ");
        console.log(track)
        const formalVehicle = item.vehicle.charAt(0).toUpperCase() + item.vehicle.slice(1);
        const runner = res.times[0].username;
        const time = res.times[0].time;
        const runDate = res.times[0].tstamp;
        const shortcutPrint = shortcut === "shortcut" ? "[Shortcut]" : "";
        const daysAgo = datesDaysDifference(runDate)
        this.messageData.response = `${track} [${formalVehicle}][${laps}-lap]${shortcutPrint} WR: ${time} by ${runner} - ${daysAgo} days ago`;

        return this.messageData;
    }
}

export class TimeTrialPersonalBestDiddyKongRacing implements ICommand {
    private jsonTimeTrials = new JsonTimeTrials();

    constructor(public messageData: MessageData, private targetUser: string) {

    }

    parseMessage = () => {
        const { message } = this.messageData;
        let query = message.split(" ").slice(2);
        let tracks = this.jsonTimeTrials.data()
        let laps = "3";
        let isShortcut = false
        let vehicle: string;
        let filteredMessage = message.split(" ").slice(2)
            .filter((word: string) => {
                if (parseInt(word) === 1) laps = "1";
                return parseInt(word) !== 1;
            })
            .filter((word: string) => {
                const shortcutKeywords = [ "shortcut", "short", "sc" ];
                if (shortcutKeywords.includes(word)) isShortcut = true;
                return !shortcutKeywords.includes(word);
            })
            .filter((word: string) => {
                const vehicles = [ "CAR", "HOVER", "PLANE" ];
                if (vehicles.includes(word.toUpperCase())) {
                    vehicle = word;
                    tracks = tracks.filter((track: ITimeTrialJson) => {
                        return track.vehicle.toLowerCase() === vehicle.toLowerCase()
                    })
                }
                return !vehicles.includes(word.toUpperCase());
            })
            .filter((word: string) => {
                return word !== "3";
            });
        const trackQuery = filteredMessage.join(" ");
        console.log("filteredMessage:", filteredMessage)
        if (tracks.length === 0) tracks = this.jsonTimeTrials.data();
        // console.log("tracks:", tracks)
        console.log("trackQuery:", trackQuery)

        return { query: filteredMessage, dkrLevels: tracks, isShortcut, laps };
    };

    private static trackNameFormatted = (item: ITimeTrialJson) => {
        const track = item.name
            .split("-")
            .map((word) => {
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(" ");
        return track;
    }

    run = async () => {
        const { query, dkrLevels, isShortcut, laps } = this.parseMessage();
        let shortcut = "standard"
        if (isShortcut) shortcut = "shortcut"
        const [ { item } ] = fuseSearch<ITimeTrialJson>(dkrLevels, query.join(" "));
        const apiTimeTrialPersonalBest = new Api<ITimeTrialResponse>(dkr64API);
        const worldRecordApi = new TimeTrialPersonalBestApi(apiTimeTrialPersonalBest, item, laps, shortcut, "habbe");
        const res = await worldRecordApi.fetch()
        const run = res.times.find((run) => {
            return run.username.toUpperCase() === this.targetUser.toUpperCase()
        })
        if (run === undefined) {
            throw new Error("Runner not found")
        }
        const track = TimeTrialPersonalBestDiddyKongRacing.trackNameFormatted(item);
        console.log(track)
        const formalVehicle = item.vehicle.charAt(0).toUpperCase() + item.vehicle.slice(1);
        const runner = run.username;
        const time = run.time;
        const runDate = run.tstamp;
        const placement = `#${run.ranking}`
        const shortcutPrint = shortcut === "shortcut" ? "[Shortcut]" : "";
        const daysAgo = datesDaysDifference(runDate)
        this.messageData.response = `${run.username}'s ${track} [${placement}][${formalVehicle}][${laps}-lap]${shortcutPrint} PB: ${time} by ${runner} - ${daysAgo} days ago`;

        return this.messageData;
    }
}
