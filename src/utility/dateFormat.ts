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

export const dateToLetters = (dateObject: IletterFormatedDate): string => {
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
  let hours = Math.floor(((seconds % 31536000) % 86400) / 3600);
  let mins = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
  let secs = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
  // let daysStr = days > 0 ? days + "d " : "";
  str += days > 0 ? days + "d " : "";
  // if (days > 0) str += days + "d ";
  // let hoursStr =
  //   hours > 0 ? (hours < 10 ? "0" + hours + ":" : hours + ":") : "";
  str += hours > 0 ? (hours < 10 ? "0" + hours + ":" : hours + ":") : "";
  // if (hours > 0) {
  //   if (hours < 10) {
  //     str += "0" + hours + ":";
  //   } else {
  //     str += hours + ":";
  //   }
  // }
  // let minsStr = mins > 0 ? (mins < 10 ? "0" + mins + ":" : mins + ":") : "";
  str += mins > 0 ? (mins < 10 ? "0" + mins + ":" : mins + ":") : "";
  // if (mins > 0) {
  //   if (mins < 10) {
  //     str += "0" + mins + ":";
  //   } else {
  //     str += mins + ":";
  //   }
  // }
  console.log(days, hours, mins);

  str += hours === 0 && mins === 0 ? secs + "s" : secs < 0 ? "0" + secs : secs;
  // if (secs > 0) {
  //   if (hours < 0 && mins < 0) {
  //     str += secs + "s";
  //   } else if (secs < 10) {
  //     str += "0" + secs;
  //   } else {
  //     str += secs + "";
  //   }
  // }
  return str.trim();
};

export const datesDaysDifference = (date: string): number => {
  const daysAgo = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 86400000
  );
  return daysAgo;
};

export const youtubeDurationToHHMMSS = (youtubeDuration: string) => {
  // PT10S
  // PT3M31S
  // PT10H1M26S
  const youtubeDurationRegex: RegExp = /PT(\d?\dH)?(\d?\dM)?(\d?\dS)/;
  const youtubeRegex: RegExpExecArray | null =
    youtubeDurationRegex.exec(youtubeDuration);
  if (!youtubeRegex) return "N/A";
  const paddedDuration: (string | undefined)[] = youtubeRegex
    .slice(1)
    .map((digit) => {
      if (typeof digit === "undefined") return;
      if (digit.length === 2) {
        return "0" + digit.slice(0, -1);
      }
      return digit.slice(0, -1);
    });
  let paddedTime: string = paddedDuration
    .filter((dd) => dd !== undefined)
    .join(":");
  if (paddedTime.length == 2) {
    paddedTime = "00:" + paddedTime;
  }

  return paddedTime;
};

export const numberToRoundedWithLetter = (views: string) => {
  const viewsNum = parseInt(views);
  let suffix;
  let zeros;
  if (viewsNum > Math.pow(10, 9)) {
    suffix = "B";
    zeros = 9;
  } else if (viewsNum > Math.pow(10, 6)) {
    suffix = "M";
    zeros = 6;
  } else if (viewsNum > Math.pow(10, 3)) {
    suffix = "K";
    zeros = 3;
  } else {
    suffix = "";
    zeros = 0;
  }
  return (viewsNum / Math.pow(10, zeros)).toFixed(zeros ? 1 : 0) + suffix;
};
