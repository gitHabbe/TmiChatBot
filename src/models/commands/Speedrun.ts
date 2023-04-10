import { Runner } from ".prisma/client"
import { ITimeTrial, ITimeTrialJson, ITimeTrialResponse, ITrack } from "../../interfaces/specificGames"
import { ILeaderboardResponse, } from "../../interfaces/speedrun"
import { datesDaysDifference, floatToHHMMSS } from "../../utility/dateFormat"
import { fuseSearch } from "../../utility/fusejs"
import { RunnerPrisma } from "../database/RunnerPrisma"
import { JsonTimeTrials } from "../JsonArrayFile"
import { ICommand } from "../../interfaces/Command"
import { ParseMessage } from "../../utility/ParseMessage"
import { MessageData } from "../tmi/MessageData"
import { ModuleFamily } from "../../interfaces/tmi"
import { DiddyKongRacingLeaderboard } from "../fetch/SpeedrunCom"
import { DiddyKongRacingTimeTrialLeaderboard } from "../fetch/DKR64"
import { ChatError } from "../error/ChatError"

class TimeTrialFilter {
    private jsonTimeTrials = new JsonTimeTrials();
    tracks: ITimeTrialJson[] = this.jsonTimeTrials.data()
    public laps: string = "3"
    public isShortcut: boolean = false
    public vehicle: string = "";
    public filteredMessage = this.message.split(" ").slice(2)

    constructor(private message: string) {}

    parse() {
        this.filteredMessage = this.filteredMessage
            .filter(this.isLapsIncluded())
            .filter(this.isShortcutIncluded())
            .filter(this.isVehicleIncluded())
        if (this.tracks.length === 0) this.tracks = this.jsonTimeTrials.data();
        if (this.vehicle === "") {
            this.tracks = this.tracks.filter((track: ITimeTrialJson) => {
                return track.default
            })
        }
    }

    private isVehicleIncluded() {
        const vehicles = [ "car", "hover", "plane" ]
        return (word: string) => {
            if (vehicles.includes(word.toLowerCase())) {
                this.vehicle = word
                this.tracks = this.tracks.filter((track: ITimeTrialJson) => {
                    return track.vehicle.toLowerCase() === word.toLowerCase()
                })
                return false
            }
            return true
        }
    }

    private isShortcutIncluded() {
        return (word: string) => {
            const shortcutKeywords = [ "shortcut", "short", "sc" ]
            if (shortcutKeywords.includes(word.toLowerCase())) {
                this.isShortcut = true
                return false
            }
            return true
        }
    }

    private isLapsIncluded() {
        return (word: string) => {
            if (word === "1") this.laps = "1"
            return word !== this.laps
        }
    }
}

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

    constructor(public messageData: MessageData) {}

    parseMessage() {
        const { message } = this.messageData;
        const timeTrialFilter = new TimeTrialFilter(message)
        timeTrialFilter.parse()
        return {
            query: timeTrialFilter.filteredMessage,
            dkrLevels: timeTrialFilter.tracks,
            isShortcut: timeTrialFilter.isShortcut,
            laps: timeTrialFilter.laps
        }
    };

    async run() {
        const { query, dkrLevels, isShortcut, laps } = this.parseMessage();
        const shortcut = isShortcut ? "shortcut" : "standard"
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

    constructor(public messageData: MessageData, private targetUser: string) {}

    parseMessage() {
        const { message } = this.messageData;
        const timeTrialFilter = new TimeTrialFilter(message)
        timeTrialFilter.parse()
        return {
            query: timeTrialFilter.filteredMessage,
            dkrLevels: timeTrialFilter.tracks,
            isShortcut: timeTrialFilter.isShortcut,
            laps: timeTrialFilter.laps
        }
    };

    private static trackNameFormatted = (item: ITimeTrialJson) => {
        return item.name
            .split("-")
            .map((word) => {
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(" ");
    }

    async run() {
        const { query, dkrLevels, isShortcut, laps } = this.parseMessage();
        const raceType = isShortcut ? "shortcut" : "standard"
        const [ { item } ] = fuseSearch<ITimeTrialJson>(dkrLevels, query.join(" "));
        const dkrtt = new DiddyKongRacingTimeTrialLeaderboard(item, parseInt(laps), raceType);
        const res: ITimeTrialResponse = await dkrtt.fetchPersonalBest(this.targetUser);
        const run: ITimeTrial | undefined = res.times.find((run) => {
            return run.username.toUpperCase() === this.targetUser.toUpperCase()
        })
        if (!run) { throw new ChatError("Run not found") }
        const track = TimeTrialPersonalBestDiddyKongRacing.trackNameFormatted(item);
        const formalVehicle = item.vehicle.charAt(0).toUpperCase() + item.vehicle.slice(1);
        const { time, ranking, tstamp, username } = run
        const placement = `#${ranking}`
        const shortcutPrint = raceType === "shortcut" ? "[Shortcut]" : "";
        const daysAgo = datesDaysDifference(tstamp)
        this.messageData.response = `${username}'s ${track} [${placement}][${formalVehicle}][${laps}-lap]${shortcutPrint} PB: ${time} - ${daysAgo} days ago`;

        return this.messageData;
    }
}
