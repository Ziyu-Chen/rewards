const chai = require('chai');
const chaiHttp = require('chai-http');
const { convertTimestampToString, getNextDateTimestamp } = require('../src/utils');
chai.use(chaiHttp);
const { setupServer } = require('../src/server');
chai.should();

const server = setupServer();
describe('Rewards API Server', () => {
  let request;

  beforeEach(() => {
    request = chai.request(server);
  });

  it('should return an error when the user does not exist in the user table yet.', async () => {
    const res = await request.patch('/users/1/rewards/2020-03-18T00:00:00Z/redeem');
    res.should.be.json;
    JSON.parse(res.text).error.should.deep.equal({
      message: 'The user 1 does not exist in the user table.'
    });
  });

  it('should return a list of weekly rewards for a given user and date.', async () => {
    const res = await request.get('/users/1/rewards?at=2020-03-19T12:00:00Z');
    res.should.be.json;
    JSON.parse(res.text).data.should.deep.equal([
      {
        availableAt: '2020-03-15T00:00:00Z',
        redeemedAt: null,
        expiresAt: '2020-03-16T00:00:00Z'
      },
      {
        availableAt: '2020-03-16T00:00:00Z',
        redeemedAt: null,
        expiresAt: '2020-03-17T00:00:00Z'
      },
      {
        availableAt: '2020-03-17T00:00:00Z',
        redeemedAt: null,
        expiresAt: '2020-03-18T00:00:00Z'
      },
      {
        availableAt: '2020-03-18T00:00:00Z',
        redeemedAt: null,
        expiresAt: '2020-03-19T00:00:00Z'
      },
      {
        availableAt: '2020-03-19T00:00:00Z',
        redeemedAt: null,
        expiresAt: '2020-03-20T00:00:00Z'
      },
      {
        availableAt: '2020-03-20T00:00:00Z',
        redeemedAt: null,
        expiresAt: '2020-03-21T00:00:00Z'
      },
      {
        availableAt: '2020-03-21T00:00:00Z',
        redeemedAt: null,
        expiresAt: '2020-03-22T00:00:00Z'
      }
    ]);
  });

  it("should return an error when the user's reward has not been activated yet.", async () => {
    const res = await request.patch('/users/1/rewards/2020-02-18T00:00:00Z/redeem');
    res.should.be.json;
    JSON.parse(res.text).error.should.deep.equal({
      message: 'This reward has not been activated yet.'
    });
  });

  it("should return an error when the user's reward has has already expired.", async () => {
    const res = await request.patch('/users/1/rewards/2020-03-18T00:00:00Z/redeem');
    res.should.be.json;
    JSON.parse(res.text).error.should.deep.equal({
      message: 'This reward has already expired.'
    });
  });

  it('should return a list of weekly rewards for a given user and date.', async () => {
    const res = await request.get('/users/1/rewards?at=3023-03-19T12:00:00Z');
    res.should.be.json;
    JSON.parse(res.text).data.should.deep.equal([
      {
        availableAt: '3023-03-16T00:00:00Z',
        redeemedAt: null,
        expiresAt: '3023-03-17T00:00:00Z'
      },
      {
        availableAt: '3023-03-17T00:00:00Z',
        redeemedAt: null,
        expiresAt: '3023-03-18T00:00:00Z'
      },
      {
        availableAt: '3023-03-18T00:00:00Z',
        redeemedAt: null,
        expiresAt: '3023-03-19T00:00:00Z'
      },
      {
        availableAt: '3023-03-19T00:00:00Z',
        redeemedAt: null,
        expiresAt: '3023-03-20T00:00:00Z'
      },
      {
        availableAt: '3023-03-20T00:00:00Z',
        redeemedAt: null,
        expiresAt: '3023-03-21T00:00:00Z'
      },
      {
        availableAt: '3023-03-21T00:00:00Z',
        redeemedAt: null,
        expiresAt: '3023-03-22T00:00:00Z'
      },
      {
        availableAt: '3023-03-22T00:00:00Z',
        redeemedAt: null,
        expiresAt: '3023-03-23T00:00:00Z'
      }
    ]);
  });

  it("should return an error when the user's reward is not available yet.", async () => {
    const res = await request.patch('/users/1/rewards/3023-03-18T00:00:00Z/redeem');
    res.should.be.json;
    JSON.parse(res.text).error.should.deep.equal({
      message: 'This reward is not available yet.'
    });
  });

  let redeemedAt;
  const today = new Date();
  const availableTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const availableAt = convertTimestampToString(availableTimestamp);

  it('should return the redeemed reward.', async () => {
    const expiresAt = convertTimestampToString(getNextDateTimestamp(availableTimestamp));
    await request.get(`/users/1/rewards?at=${availableAt}`);
    request = chai.request(server);
    const res = await request.patch(`/users/1/rewards/${availableAt}/redeem`);
    res.should.be.json;
    const data = JSON.parse(res.text).data;
    data['availableAt'].should.equal(availableAt);
    data['expiresAt'].should.equal(expiresAt);
    redeemedAt = data['redeemedAt'];
  });

  it('should return a list of weekly rewards for a given user and date.', async () => {
    const res = await request.get(`/users/1/rewards?at=${availableAt}`);
    res.should.be.json;
    JSON.parse(res.text)
      .data.find((item) => item.availableAt === availableAt)
      .redeemedAt.should.equal(redeemedAt);
  });

  it("should return an error when the user's reward has already been redeemed.", async () => {
    const res = await request.patch(`/users/1/rewards/${availableAt}/redeem`);
    res.should.be.json;
    JSON.parse(res.text).error.should.deep.equal({
      message: 'This reward has already been redeemed.'
    });
  });

  it("should return an error when the user's reward is not available yet.", async () => {
    const tomorrow = convertTimestampToString(availableTimestamp + 86400000);
    await request.get(`/users/1/rewards?at=${tomorrow}`);
    request = chai.request(server);
    const res = await request.patch(`/users/1/rewards/${tomorrow}/redeem`);
    res.should.be.json;
    JSON.parse(res.text).error.should.deep.equal({
      message: 'This reward is not available yet.'
    });
  });

  it("should return an error when the user's reward has has already expired.", async () => {
    const yesterday = convertTimestampToString(availableTimestamp - 86400000);
    await request.get(`/users/1/rewards?at=${yesterday}`);
    request = chai.request(server);
    const res = await request.patch(`/users/1/rewards/${yesterday}/redeem`);
    res.should.be.json;
    JSON.parse(res.text).error.should.deep.equal({
      message: 'This reward has already expired.'
    });
  });
});
