import { ParseMessage } from "../../../utility/ParseMessage";
import { ICommand } from "../../../interfaces/Command";
import { fuseSearch } from "../../../utility/fusejs";
import { ITrack } from "../../../interfaces/specificGames";
import { LeaderboardApi } from "../../fetch/DepricatedSpeedrunCom";
import { ILeaderboardResponse } from "../../../interfaces/speedrun";
import { speedrunAPI } from "../../../config/speedrunConfig";
import { RunnerPrisma } from "../../database/RunnerPrisma";
import { datesDaysDifference, floatToHHMMSS } from "../../../utility/dateFormat";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";
import { DiddyKongRacingTimeTrialLeaderboard } from "../../fetch/DKR64";
import { DiddyKongRacingLeaderboard } from "../../fetch/SpeedrunCom";

export class IndividualPersonalBestDiddyKongRacing extends ParseMessage implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN;

    constructor(messageData: MessageData) {
        super(messageData);
    }

    run = async () => {
        const { query, dkrLevels } = this.parseMessage();
        // console.log(query, dkrLevels)
        const [ { item } ] = fuseSearch<ITrack>(dkrLevels, query.join(" "));
        const diddyKongRacingLeaderboard = new DiddyKongRacingLeaderboard(item);
        const { data: leaderboard } = await diddyKongRacingLeaderboard.fetchLeaderboard();
        // const { data: leaderboard } = await leaderboardApi.fetch();
        const { name, vehicle } = item;
        const messageArray = this.messageData.message.split(" ");
        const runnerName = messageArray.splice(1, 1).join();
        const runnerModel = new RunnerPrisma();
        const runner = await runnerModel.get(runnerName);
        console.log(runner)
        if (!runner) {
            this.messageData.response = `Runner ${runnerName} not found`;
            return this.messageData;
        }
        const run = leaderboard.runs.find(run => {
            return run.run.players[0].id === runner.id
        });
        if (!run) {
            this.messageData.response = `Runner ${runner.name} has no pb for that track`;
            return this.messageData;
        }
        console.log(run);
        const personalBest: number = run.run.times.primary_t;
        const personalBestTime: string = floatToHHMMSS(personalBest);
        const personalBestDate: string = run.run.date;
        const daysAgo: number = datesDaysDifference(personalBestDate);
        this.messageData.response = `${runner.name} ${name} ${vehicle} PB: ${personalBestTime} - ${daysAgo} days ago`;

        return this.messageData;
    }
}