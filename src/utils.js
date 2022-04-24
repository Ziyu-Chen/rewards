const convertStringToTimestamp = (string) => {
  const year = Number(string.slice(0, 4));
  const month = Number(string.slice(5, 7));
  const day = Number(string.slice(8, 10));
  return new Date(year, month - 1, day).getTime();
};

const convertTimestampToString = (timestamp) => {
  const date = new Date(timestamp);
  const padding = (number) => (number < 10 ? '0' + String(number) : String(number));
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${year}-${padding(month)}-${padding(day)}T${padding(hour)}:${padding(minute)}:${padding(second)}Z`;
};

const getFirstDayTimestampInWeek = (timestamp) => {
  const date = new Date(timestamp);
  return new Date(timestamp - date.getDay() * 86400000).getTime();
};

const getDayTimestampsInWeek = (firstDayTimestamp) => {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => firstDayTimestamp + day * 86400000);
};

const getNextDateTimestamp = (timestamp) => {
  return timestamp + 86400000;
};

module.exports = {
  convertStringToTimestamp,
  convertTimestampToString,
  getFirstDayTimestampInWeek,
  getDayTimestampsInWeek,
  getNextDateTimestamp
};
