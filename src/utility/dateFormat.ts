interface ILetterFormattedDate {
  dayDistance: number;
  hourDistance: number;
  minuteDistance: number;
  secondDistance: number;
}

export const millisecondsToDistance = (
  milliseconds: number
): ILetterFormattedDate => {
  const seconds: number = milliseconds / 1000;
  const secondsInYear = 31536000;
  const secondsInDay = 86400;
  const secondsInHour = 3600;
  const secondsInMinute = 60;
  const yearsLeftover = seconds % secondsInYear;
  const dayDistance: number = Math.floor(yearsLeftover / secondsInDay);
  const hourDistance: number = Math.floor((yearsLeftover % secondsInDay) / secondsInHour);
  const minuteDistance: number = Math.floor(((yearsLeftover % secondsInDay) % secondsInHour) / secondsInMinute);
  const secondDistance: number = Math.floor(((yearsLeftover % secondsInDay) % secondsInHour) % secondsInMinute);

  return {
    dayDistance,
    hourDistance,
    minuteDistance,
    secondDistance,
  };
};

export const dateToLetters = (dateObject: ILetterFormattedDate): string => {
  const days: string = dateObject.dayDistance > 0 ? `${dateObject.dayDistance}d` : "";
  const hours: string = dateObject.hourDistance > 0 ? `${dateObject.hourDistance}h` : "";
  const minutes: string = dateObject.minuteDistance > 0 ? `${dateObject.minuteDistance}m` : "";
  const seconds: string = dateObject.secondDistance > 0 ? `${dateObject.secondDistance}s` : "";

  return `${days} ${hours} ${minutes} ${seconds}`.trim();
};

export const secondsToHHMMSS = (seconds: number) => {
  let str: string = "";
  let days = Math.floor((seconds % 31536000) / 86400);
  let hours = Math.floor(((seconds % 31536000) % 86400) / 3600);
  let mins = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
  let secs = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
  str += days > 0 ? days + "d " : "";
  str += hours > 0 ? (hours < 10 ? "0" + hours + ":" : hours + ":") : "";
  str += mins > 0 ? (mins < 10 ? "0" + mins + ":" : mins + ":") : "";
  str += hours === 0 && mins === 0 ? secs + "s" : secs < 0 ? "0" + secs : secs;

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

export const numberToRoundedWithLetter = (views: string): string => {
  const viewsNum: number = parseInt(views);
  let suffix: string;
  let zeros: number;
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

export const floatToHHMMSS = (time: number) => {
  let str = "";
  let hrs = Math.floor((((time % 31536000) % 86400) / 3600));
  if (hrs > 0) {
    if (hrs < 10) {
      str += "0" + hrs + ":";
    } else {
      str += hrs + ":";
    }
  }
  let mins = Math.floor((((time % 31536000) % 86400) % 3600) / 60);
  if (mins > 0) {
    if (mins < 10) {
      str += "0" + mins + ":";
    } else {
      str += mins + ":";
    }
  }
  let secs = Math.floor((((time % 31536000) % 86400) % 3600) % 60);
  if (secs > 0) {
    if (secs < 10) {
      str += "0" + secs;
    } else {
      str += secs;
    }
  }
  let milli = String(time).split(".");
  if(milli[1] != undefined) return str + "." + milli[1]
  return str;
};

export const stringFloatToHHMMSSmm = (time: string) => {
  let str = "";
  let mins = Math.floor((((parseInt(time) % 31536000) % 86400) % 3600) / 60);
  if (mins > 0) {
    if (mins < 10) {
      str += "0" + mins + ":";
    } else {
      str += mins + ":";
    }
  }
  let secs = Math.floor((((parseInt(time) % 31536000) % 86400) % 3600) % 60);
  if (secs > 0) {
    if (secs < 10) {
      str += "0" + secs;
    } else {
      str += secs;
    }
  }

  let milli = String(time).split(".");
  return str + "." + milli[1];
};
export const stringToProbabilityPercent = (
  event1Count: string,
  event2Count: string
) => {
  const event1 = parseInt(event1Count);
  const totalCount = parseInt(event1Count) + parseInt(event2Count);

  return Math.round((event1 / totalCount) * 100);
};
