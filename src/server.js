const express = require('express');
const {
  convertStringToTimestamp,
  convertTimestampToString,
  getFirstDayTimestampInWeek,
  getDayTimestampsInWeek,
  getNextDateTimestamp
} = require('./utils');

// In memory data storage
const userTable = {};

const setupServer = () => {
  const app = express();

  app.get('/users/:userId/rewards', (req, res) => {
    const { userId } = req.params;
    const { at } = req.query;
    const atTimestamp = convertStringToTimestamp(at);
    const firstDayTimestamp = getFirstDayTimestampInWeek(atTimestamp);

    // Check if the user exists in the user table. If not, create the user.
    if (!(userId in userTable)) {
      userTable[userId] = {};
    }

    // Check if the timestamp of the first day of the week exists in the table.
    // If not, create an array to record the redemption time of each reward in the week.
    if (!(firstDayTimestamp in userTable[userId])) {
      userTable[userId][firstDayTimestamp] = Array(7).fill(null);
    }

    const availableTimestamps = getDayTimestampsInWeek(firstDayTimestamp);
    const data = availableTimestamps.map((availableTimestamp, day) => {
      const expiredTimestamp = getNextDateTimestamp(availableTimestamp);
      const redeemedTimestamp = userTable[userId][firstDayTimestamp][day];
      return {
        availableAt: convertTimestampToString(availableTimestamp),
        redeemedAt: redeemedTimestamp && convertTimestampToString(redeemedTimestamp),
        expiresAt: convertTimestampToString(expiredTimestamp)
      };
    });
    res.send({ data });
  });

  app.patch('/users/:userId/rewards/:availableAt/redeem', (req, res, next) => {
    const currentTimestamp = Date.now();
    const { userId, availableAt } = req.params;
    const availableTimestamp = convertStringToTimestamp(availableAt);
    const firstDayTimestamp = getFirstDayTimestampInWeek(availableTimestamp);

    // Check if the user exists in the user table. If not, return an error.
    if (!(userId in userTable)) {
      const error = {
        message: `The user ${userId} does not exist in the user table.`
      };
      res.status(404).send({ error });
      return;
    }

    // Check if the timestamp of the first day of the week exists in the table.
    // If not, return an error.
    if (!(firstDayTimestamp in userTable[userId])) {
      const error = { message: 'This reward has not been activated yet.' };
      res.status(404).send({ error });
      return;
    }

    // Check if the reward has already been redeemed. If so, return an error.
    const availableDate = new Date(availableTimestamp);
    if (userTable[userId][firstDayTimestamp][availableDate.getDay()] !== null) {
      const error = { message: 'This reward has already been redeemed.' };
      res.status(403).send({ error });
      return;
    }

    // Check if the reward is available. If not, return an error.
    if (currentTimestamp < availableTimestamp) {
      const error = { message: 'This reward is not available yet.' };
      res.status(403).send({ error });
      return;
    }

    // Check if the reward has already expired. If so, return an error.
    const expiredTimestamp = getNextDateTimestamp(availableTimestamp);
    if (currentTimestamp >= expiredTimestamp) {
      const error = { message: 'This reward has already expired.' };
      res.status(403).send({ error });
      return;
    }

    // Record the redeemed time.
    userTable[userId][firstDayTimestamp][availableDate.getDay()] = currentTimestamp;

    const data = {
      availableAt: convertTimestampToString(availableTimestamp),
      redeemedAt: convertTimestampToString(currentTimestamp),
      expiresAt: convertTimestampToString(expiredTimestamp)
    };
    res.send({ data });
  });

  return app;
};

module.exports = { setupServer };
