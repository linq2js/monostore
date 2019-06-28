const modifyDate = (
  date,
  year = 0,
  month = 0,
  day = 0,
  hour = 0,
  minute = 0,
  second = 0,
  milli = 0
) =>
  new Date(
    date.getFullYear() + year,
    date.getMonth() + month,
    date.getDate() + day,
    date.getHours() + hour,
    date.getMinutes() + minute,
    date.getSeconds() + second,
    date.getMilliseconds() + milli
  );

export default  {
  month(date, value) {
    return modifyDate(date, 0, value);
  },
  year(date, value) {
    return modifyDate(date, value);
  },
  day(date, value) {
    return modifyDate(date, 0, 0, value);
  },
  week(date, value) {
    return modifyDate(date, 0, 0, value * 7);
  },
  hour(date, value) {
    return modifyDate(date, 0, 0, 0, value);
  },
  minute(date, value) {
    return modifyDate(date, 0, 0, 0, 0, value);
  },
  second(date, value) {
    return modifyDate(date, 0, 0, 0, 0, 0, value);
  },
  milli(date, value) {
    return modifyDate(date, 0, 0, 0, 0, 0, 0, value);
  }
};
