import { format, formatDuration, intervalToDuration } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function classNames(...classes: any): string {
  return classes.filter(Boolean).join(" ");
}

export function round(num: number, places: number) {
  const multiplier = Math.pow(10, places);
  return Math.round(num * multiplier) / multiplier;
}

export enum TimeFormat {
  Date = "yyyy-MM-dd",
  DateDisplay = "M/d/yyyy",
  DateDisplayShort = "M/d/yy",
  DateTimeDisplayShort = "M/d/yy h:mmaaa",
}

export const DurationAbbreviations = {
  years: "yrs",
  year: "yr",
  months: "mos",
  month: "mo",
  weeks: "wks",
  week: "wk",
  days: "days",
  day: "day",
  hours: "hrs",
  hour: "hr",
  minutes: "mins",
  minute: "min",
  seconds: "secs",
  second: "sec",
};

export enum MillisecondsPerUnitTime {
  second = 1000,
  minute = second * 60,
  hour = minute * 60,
  day = hour * 24,
  month = day * 30.437,
  year = day * 365.25,
}

export function timeToMilliseconds(
  unitsOfTime: number,
  unit: keyof typeof MillisecondsPerUnitTime
) {
  return MillisecondsPerUnitTime[unit] * unitsOfTime;
}

export function millisecondsToTime(
  unitsOfTime: number,
  unit: keyof typeof MillisecondsPerUnitTime
) {
  return unitsOfTime / MillisecondsPerUnitTime[unit];
}

export function getYearsElapsed(startDate: string, endDate?: string): number {
  const endDateToUse = endDate ? new Date(endDate) : new Date();
  const msElapsed = endDateToUse.getTime() - new Date(startDate).getTime();
  return millisecondsToTime(msElapsed, "year");
}

/**
 * Input time using UTC format datetimez
 * e.g.:
 *  postgres:              2022-07-23T16:59:56.351985+00:00
 *  js Date.toISOString(): 2022-07-23T16:59:56.351Z
 */
export function getMillisecondsElapsed(
  startDateTime: string,
  endDateTime?: string
): number {
  return new Date(endDateTime).getTime() - new Date(startDateTime).getTime();
}

/**
 * Get a duration in milliseconds formatted for readability.
 */
export function getFormattedDuration(
  milliseconds: number,
  shorten = false
): string {
  if (milliseconds === 0) return "-";
  const now = new Date();
  const duration = intervalToDuration({
    start: now,
    end: now.getTime() + milliseconds,
  });
  let formattedDuration = formatDuration(duration);
  // date-fns returns blank for under 1 second
  if (formattedDuration === "") formattedDuration = "<1 second";

  if (shorten) {
    for (const original in DurationAbbreviations) {
      if (
        Object.prototype.hasOwnProperty.call(DurationAbbreviations, original)
      ) {
        const abbreviation = DurationAbbreviations[original];
        formattedDuration = formattedDuration.replace(original, abbreviation);
      }
    }
  }

  return formattedDuration;
}

export function formatDateString(
  dateString: string,
  displayFormat: TimeFormat
): string {
  return format(new Date(dateString), displayFormat);
}
