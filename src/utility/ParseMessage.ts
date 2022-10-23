import { ITrack } from "../interfaces/specificGames";
import { JsonLevels } from "../models/JsonArrayFile";
import { MessageData } from "../models/MessageData";

export class ParseMessage {
  private levels: ITrack[] = new JsonLevels().data();

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

  constructor(public messageData: MessageData) {
  }
}