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
