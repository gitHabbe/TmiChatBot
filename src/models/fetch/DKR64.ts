import { ITimeTrialJson, ITimeTrialResponse } from "../../interfaces/specificGames";
import { AxiosInstance } from "axios";
import { dkr64API } from "../../config/speedrunConfig";

export class DiddyKongRacingTimeTrialLeaderboard {
    private worldRecordBaseURL = `/world_record?api_token=${process.env.DKR64_API_TOKEN}`;
    private worldRecordURL = `${this.worldRecordBaseURL}&track=${this.track.name}&vehicle=${this.track.vehicle}&laps=${this.laps}&type=${this.type}`;
    private personBestBaseUrl = `/times?api_token=${process.env.DKR64_API_TOKEN}`;
    private personalBestURL: string = `${this.personBestBaseUrl}&track=${this.track.name}&vehicle=${this.track.vehicle}&laps=${this.laps}&type=${this.type}`;

    constructor(
        private track: ITimeTrialJson,
        private laps: number,
        private type: string,
        private axiosInstance: AxiosInstance = dkr64API
    ) {
    }

    async fetchWorldRecord(): Promise<ITimeTrialResponse> {
        const axiosResponse = await this.axiosInstance.get(this.worldRecordURL);
        return axiosResponse.data;
    }

    async fetchPersonalBest(username: string): Promise<ITimeTrialResponse> {
        const personalBestUrl = this.personalBestURL + `&user=${username}`;
        const axiosResponse = await this.axiosInstance.get<ITimeTrialResponse>(personalBestUrl);
        return axiosResponse.data;
    }
}