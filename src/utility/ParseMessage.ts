import { ITrack } from "../interfaces/specificGames";
import { JsonLevels } from "../models/JsonArrayFile";
import { MessageData } from "../models/MessageData";

export class ParseMessage {
  private levels: ITrack[] = new JsonLevels().data();

  constructor(public messageData: MessageData) {}

  parseMessage = () => {
    const { message } = this.messageData;
    const supportedVehicles = [ "car", "hover", "plane" ];
    let query = message.split(" ").slice(2);
    const specifiedVehicle = query.find((word: string) => supportedVehicles.includes(word));

    if (specifiedVehicle) {
      query = this.filterVehicle(query, specifiedVehicle);
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

  private filterVehicle(query: string[], specifiedVehicle: string) {
    query = query.filter((word: string) => word !== specifiedVehicle);
    this.levels = this.levels.filter((track: ITrack) => {
      return track.vehicle === specifiedVehicle;
    });
    return query;
  }
}