import { ITrack } from "../interfaces/specificGames";
import { JsonLevels } from "../models/JsonArrayFile";
import { MessageData } from "../models/tmi/MessageData";

export class ParseMessage {
  private levels: ITrack[] = new JsonLevels().data();

  constructor(public messageData: MessageData) {}

  parseMessage = () => {
    const { message } = this.messageData;
    const supportedVehicles = [ "car", "hover", "plane" ];
    let query: string[] = message.split(" ").slice(2);
    const specifiedVehicle = query.find((word: string) => supportedVehicles.includes(word));

    if (specifiedVehicle) {
      query = this.removeVehicleNames(query, specifiedVehicle);
    } else {
      this.onlyStandardVehicles();
    }
    query = this.onlyAbbreviated(query);

    return { query, dkrLevels: this.levels };
  };

  private onlyAbbreviated(query: string[]): string[] {
    const isAbbreviated = this.levels.filter((track: ITrack) => {
      return query.includes(track.abbreviation);
    });
    if (isAbbreviated.length > 0) {
      query = [ isAbbreviated[0].name ];
      this.levels = isAbbreviated;
    }
    return query;
  }

  private onlyStandardVehicles() {
    this.levels = this.levels.filter((track: ITrack) => {
      return track.default;
    });
  }

  private removeVehicleNames(query: string[], specifiedVehicle: string) {
    query = query.filter((word: string) => word !== specifiedVehicle);
    this.levels = this.levels.filter((track: ITrack) => {
      return track.vehicle === specifiedVehicle;
    });
    return query;
  }
}