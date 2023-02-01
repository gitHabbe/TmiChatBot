import { Runner } from ".prisma/client";
import { ITimeTrialJson, ITrack } from "../../interfaces/specificGames";
import { ILeaderboardResponse, } from "../../interfaces/speedrun";
import { datesDaysDifference, floatToHHMMSS } from "../../utility/dateFormat";
import { fuseSearch } from "../../utility/fusejs";
import { RunnerPrisma } from "../database/RunnerPrisma";
import { JsonTimeTrials } from "../JsonArrayFile";
import { ICommand } from "../../interfaces/Command";
import { ParseMessage } from "../../utility/ParseMessage";
import { MessageData } from "../tmi/MessageData";
import { ModuleFamily } from "../../interfaces/tmi";
import { DiddyKongRacingLeaderboard } from "../fetch/SpeedrunCom";
import { DiddyKongRacingTimeTrialLeaderboard } from "../fetch/DKR64";

export class IndividualWorldRecordDiddyKongRacing extends ParseMessage implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN

    constructor(public messageData: MessageData) {super(messageData);}

    async run(): Promise<MessageData> {
        const { query, dkrLevels } = this.parseMessage();
        const [ { item } ] = fuseSearch<ITrack>(dkrLevels, query.join(" "));
        const diddyKingRacingLeaderboard = new DiddyKongRacingLeaderboard(item);
        const { data: leaderboard }: ILeaderboardResponse = await diddyKingRacingLeaderboard.fetchWorldRecord();
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
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN
    private jsonTimeTrials = new JsonTimeTrials();

    constructor(public messageData: MessageData) {
    }

    parseMessage() {
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

    async run() {
        const { query, dkrLevels, isShortcut, laps } = this.parseMessage();
        let shortcut = "standard"
        if (isShortcut) shortcut = "shortcut"
        const [ { item } ] = fuseSearch<ITimeTrialJson>(dkrLevels, query.join(" "));
        const dkrtt = new DiddyKongRacingTimeTrialLeaderboard(item, 3, shortcut);
        const res = await dkrtt.fetchWorldRecord();
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
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN
    private jsonTimeTrials = new JsonTimeTrials();

    constructor(public messageData: MessageData, private targetUser: string) {

    }

    parseMessage() {
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

    async run() {
        const { query, dkrLevels, isShortcut, laps } = this.parseMessage();
        let shortcut = "standard"
        if (isShortcut) shortcut = "shortcut"
        const [ { item } ] = fuseSearch<ITimeTrialJson>(dkrLevels, query.join(" "));
        const dkrtt = new DiddyKongRacingTimeTrialLeaderboard(item, parseInt(laps), shortcut);
        const res = await dkrtt.fetchPersonalBest("");
        // const res = await worldRecordApi.fetch()
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
