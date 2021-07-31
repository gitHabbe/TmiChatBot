interface IletterFormatedDate {
  dayDistance: number;
  hourDistance: number;
  minuteDistance: number;
  secondDistance: number;
}

export const extractMillisecondsToObject = (
  milliseconds: number
): IletterFormatedDate => {
  const seconds = milliseconds / 1000;
  const dayDistance: number = Math.floor((seconds % 31536000) / 86400);
  const hourDistance: number = Math.floor(
    ((seconds % 31536000) % 86400) / 3600
  );
  const minuteDistance: number = Math.floor(
    (((seconds % 31536000) % 86400) % 3600) / 60
  );
  const secondDistance: number = Math.floor(
    (((seconds % 31536000) % 86400) % 3600) % 60
  );

  return {
    dayDistance,
    hourDistance,
    minuteDistance,
    secondDistance,
  };
};

export const letterFormatedDate = (dateObject: IletterFormatedDate): string => {
  const days: string =
    dateObject.dayDistance > 0 ? `${dateObject.dayDistance}d` : "";
  const hours: string =
    dateObject.hourDistance > 0 ? `${dateObject.hourDistance}h` : "";
  const minutes: string =
    dateObject.minuteDistance > 0 ? `${dateObject.minuteDistance}m` : "";
  const seconds: string =
    dateObject.secondDistance > 0 ? `${dateObject.secondDistance}s` : "";

  return `${days} ${hours} ${minutes} ${seconds}`.trim();
};

export const secondsToHHMMSS = (seconds: number) => {
  let str: string = "";
  let days = Math.floor((seconds % 31536000) / 86400);
  if (days > 0) str += days + "d ";
  let hours = Math.floor(((seconds % 31536000) % 86400) / 3600);
  if (hours > 0) {
    if (hours < 10) {
      str += "0" + hours + ":";
    } else {
      str += hours + ":";
    }
  }
  let mins = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
  if (mins > 0) {
    if (mins < 10) {
      str += "0" + mins + ":";
    } else {
      str += mins + ":";
    }
  }
  let secs = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
  if (secs > 0) {
    if (hours < 0 && mins < 0) {
      str += secs + "s";
    } else if (secs < 10) {
      str += "0" + secs;
    } else {
      str += secs + "";
    }
  }
  return str.trim();
};
