import { Runner } from ".prisma/client";
import { dkr64API, speedrunAPI } from "../../config/speedrunConfig";
import { FullGame } from "../../interfaces/prisma";
import { ITimeTrial, ITimeTrialJson, ITimeTrialResponse, ITrack } from "../../interfaces/specificGames";
import {
    ILeaderboardReponse,
    InduvidualLevelSupport,
    IRun, TimeTrialSupport,
} from "../../interfaces/speedrun";
import { datesDaysDifference, floatToHHMMSS } from "../../utility/dateFormat";
import { fuseSearch } from "../../utility/fusejs";
import { GameModel } from "../database/GamePrisma";
import { RunnerPrisma } from "../database/RunnerPrisma";
import { Leaderboard } from "../fetch/Leaderboard";
import {
    Api,
    LeaderboardApi,
    TimeTrialPersonalBestApi,
    TimeTrialWorldRecordApi,
    WorldRecordApi
} from "../fetch/SpeedrunCom";
import { JsonLevels, JsonTimeTrials } from "../JsonArrayFile";
import { StringExtract } from "../StringExtract";
import { ICommand } from "../../interfaces/Command";
import { UserModel } from "../database/UserPrisma";
import { SettingPrisma } from "../database/SettingPrisma";
import { formatWorldRecord } from "../../utility/math";
import { MessageData } from "../MessageData";

export class WorldRecord implements ICommand {
    constructor(public messageData: MessageData) {}

    run = async () => {
        const stringExtract = new StringExtract(this.messageData);
        const gameName: string = await stringExtract.game();
        const gameModel = new GameModel(gameName);
        const game: FullGame | null = await gameModel.pull();
        const query: string = await stringExtract.category();
        if (!game) {
            this.messageData.response = `Game ${gameName} not found`;
            return this.messageData;
        }
        const leaderboard = new Leaderboard(game);
        const fuzzyCategory = leaderboard.fuzzyCategory(query);
        const [ { item: category } ] = fuzzyCategory;
        const worldRecord: IRun = await leaderboard.fetchWorldRecord(category);
        this.messageData.response = await formatWorldRecord(worldRecord, category.name);

        return this.messageData;
    };
}

export class IndividualWorldRecord implements ICommand {
    constructor(public messageData: MessageData) {}

    run = async () => {
        const stringExtract = new StringExtract(this.messageData);
        const game: string = await stringExtract.game();
        switch (game.toUpperCase()) {
            case InduvidualLevelSupport.DKR:
                return new IndividualWorldRecordDiddyKongRacing(this.messageData).run();
            default:
                throw Error(`${game} doesn't support !ilwr`);
        }
    };
}

export class IndividualWorldRecordDiddyKongRacing implements ICommand {
    private levels: ITrack[] = new JsonLevels().data();

    constructor(public messageData: MessageData) {}

    parseMessage = () => {
        const { message } = this.messageData;
        const vehicles = [ "car", "hover", "plane" ];

        let query = message.split(" ").slice(2);
        const specifiedVehicle = query.find((word: string) => {
            return vehicles.includes(word);
        });
        if (specifiedVehicle) {
            query = query.filter((word: string) => word !== specifiedVehicle);
            this.levels = this.levels.filter((track: ITrack) => {
                return track.vehicle === specifiedVehicle;
            });
        } else {
            this.levels = this.levels.filter((track: ITrack) => {
                return track.default;
            });
        }
        const isAbbreviated = this.levels.filter((track: ITrack) => {
            return query.includes(track.abbreviation);
        });
        if (isAbbreviated.length > 0) {
            query = [ isAbbreviated[0].name ];
            this.levels = isAbbreviated;
        }

        return { query, dkrLevels: this.levels };
    };

    run = async () => {
        const { query, dkrLevels } = this.parseMessage();
        const [ { item } ] = fuseSearch<ITrack>(dkrLevels, query.join(" "));
        const apiLeaderboard = new Api<ILeaderboardReponse>(speedrunAPI);
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

export class PersonalBest implements ICommand {
    constructor(public messageData: MessageData) {}

    run = async () => {
        const messageArray = this.messageData.message.split(" ");
        const runnerName = messageArray.splice(1, 1).join();
        this.messageData.message = messageArray.join(" ");
        const stringExtract = new StringExtract(this.messageData);
        const gameName: string = await stringExtract.game();
        const gameModel = new GameModel(gameName);
        const game: FullGame | null = await gameModel.pull();
        const query: string = await stringExtract.category();
        if (!game) {
            this.messageData.response = `Game ${gameName} not found`;
            return this.messageData
        }
        const runnerModel = new RunnerPrisma();
        const runner = await runnerModel.get(runnerName);
        if (!runner) {
            this.messageData.response = `Runner ${runnerName} not found`;
            return this.messageData
        }
        const leaderboard = new Leaderboard(game);
        const fuzzyCategory = leaderboard.fuzzyCategory(query);
        const [ { item: category } ] = fuzzyCategory;
        const personalBest: IRun = await leaderboard.fetchPersonalBest(
            category,
            runner.id
        );
        const worldRecordDate: string = personalBest.run.date;
        const worldRecordNumber: number = personalBest.run.times.primary_t;
        const personalBestTime: string = floatToHHMMSS(worldRecordNumber);
        const daysAgo: number = datesDaysDifference(worldRecordDate);
        this.messageData.response = `${runner.name} ${category.name} PB: ${personalBestTime} - #${personalBest.place} - ${daysAgo} days ago`;

        return this.messageData;
    };
}

export class IndividualPersonalBest implements ICommand {
    constructor(public messageData: MessageData) {}

    run = async () => {
        const stringExtract = new StringExtract(this.messageData);
        const game: string = await stringExtract.game();
        switch (game.toUpperCase()) {
            case InduvidualLevelSupport.DKR:
                return new IndividualPersonalBestDiddyKongRacing(this.messageData).run();
            default:
                throw Error(`${game} doesn't support !ilpb`);
        }
    };
}


export class IndividualPersonalBestDiddyKongRacing implements ICommand {
    private levels: ITrack[] = new JsonLevels().data();

    constructor(public messageData: MessageData) {}

    parseMessage = () => {
        const { message } = this.messageData;
        console.log("message:", message)
        const vehicles = [ "car", "hover", "plane" ];

        let query = message.split(" ").slice(2);
        const specifiedVehicle = query.find((word: string) => {
            return vehicles.includes(word);
        });
        if (specifiedVehicle) {
            query = query.filter((word: string) => word !== specifiedVehicle);
            this.levels = this.levels.filter((track: ITrack) => {
                return track.vehicle === specifiedVehicle;
            });
        } else {
            this.levels = this.levels.filter((track: ITrack) => {
                return track.default;
            });
        }
        const isAbbreviated = this.levels.filter((track: ITrack) => {
            return query.includes(track.abbreviation);
        });
        if (isAbbreviated.length > 0) {
            query = [ isAbbreviated[0].name ];
            this.levels = isAbbreviated;
        }

        return { query, dkrLevels: this.levels };
    };

    run = async () => {
        const { query, dkrLevels } = this.parseMessage();
        // console.log(query, dkrLevels)
        const [ { item } ] = fuseSearch<ITrack>(dkrLevels, query.join(" "));
        const apiLeaderboard = new Api<ILeaderboardReponse>(speedrunAPI);
        const leaderboardApi = new LeaderboardApi(apiLeaderboard, item);
        const { data: leaderboard } = await leaderboardApi.fetch();
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

export class SetSpeedrunner implements ICommand {
    constructor(public messageData: MessageData) { }

    private getUser = async (channel: string) => {
        const userPrisma = new UserModel(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`User not found`);
        return user;
    }

    run = async () => {
        const { channel, message } = this.messageData;
        const newUsername: string | undefined = message.split(" ")[1];
        const user = await this.getUser(channel);
        const setting = new SettingPrisma(user);
        const settingType = "SpeedrunName";
        const isSetting = await setting.find(settingType);
        let newSetting;
        if (isSetting) {
            if (newUsername === undefined) {
                newSetting = await setting.delete(isSetting.id);
                this.messageData.response = `SpeedrunDotCom username restored to: ${channel}`;
                return this.messageData;
            }
            newSetting = await setting.update(isSetting.id, settingType, newUsername);
        } else {
            if (newUsername === undefined) {
                this.messageData.response = `No name specified.`;
                return this.messageData;
            }
            newSetting = await setting.add(settingType, newUsername)
        }
        this.messageData.response = `SpeedrunDotCom username set to: ${newSetting.value}`;

        return this.messageData;
    }
}

export class TimeTrialWorldRecord implements ICommand {
    constructor(public messageData: MessageData) {
    }

    run = async () => {
        const stringExtract = new StringExtract(this.messageData);
        const gameName: string = await stringExtract.game();
        switch (gameName.toUpperCase()) {
            case TimeTrialSupport.DKR:
                return new TimeTrialWorldRecordDiddyKongRacing(this.messageData).run();
            default:
                throw Error(`${gameName} doesn't support !ttwr`);
        }
    }
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

export class TimeTrialPersonalBest implements ICommand {
    constructor(public messageData: MessageData) {}

    run = async () => {
        console.log("messageData:", this.messageData)
        const targetUser = this.messageData.message.split(" ")[1]
        let message = this.messageData.message.split(" ")
        message.splice(1, 1)
        this.messageData.message = message.join(" ")
        const stringExtract = new StringExtract(this.messageData);
        const gameName: string = await stringExtract.game();
        switch (gameName.toUpperCase()) {
            case TimeTrialSupport.DKR:
                return new TimeTrialPersonalBestDiddyKongRacing(this.messageData, targetUser).run();
            default:
                throw Error(`${gameName} doesn't support !ttpb`);
        }
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
