const { createClient } = require('redis');
const { TimeSeriesAggregationType } = require('@redis/time-series');

class RedisTimeSeriesClient {
  constructor(redisAddress, timeWindow) {
    this.redisAddress = redisAddress || 'http://localhost:6379';
    this.redisClient = null;
    this.timeWindow = timeWindow;
  }

  async init() {
    this.redisClient = createClient(this.redisAddress);
    await this.redisClient.connect();
  }

  async queryByAppId(appId) {
    const now = Date.now();
    const queryResults = await this.redisClient?.ts.MRANGE(
      now - this.timeWindow,
      now,
      `appId=${appId}`,
      {
        AGGREGATION: {
          type: TimeSeriesAggregationType.SUM,
          timeBucket: this.timeWindow,
        },
        ALIGN: 'start',
      }
    );
    return queryResults;
  }

  //   async queryByFlagId(flagId) {
  //     const now = Date.now();
  //     const window = 100000000;
  //     const queryResults = await this.redisClient.ts.MRANGE(
  //       now - window,
  //       now,
  //       `flagId=${flagId}`,
  //       {
  //         AGGREGATION: {
  //           type: TimeSeriesAggregationType.SUM,
  //           timeBucket: window,
  //         },
  //         ALIGN: 'start',
  //       }
  //     );
  //     return queryResults;
  //   }
}

module.exports = RedisTimeSeriesClient;

/*
  bucket view of y-axis counts over x-axis tie
  onDuplicate - deals with two hits at the exact time 
  labels -> indexes for queries on Handler end
  `key = 16:failure`
  `time = Date.now()`
  `value = failureCount of flagId`
    `label -> status -> failure/success
    `flagId
  `16:failure failureCount`
  `TS.ADD 16:failure Date.now() 1 LABELS type success flagname flag_1`
  */

/*
  return value of below query:
    {
      key: '8:failure',
      samples: [ { timestamp: 1658150058511, value: 5 } ]
    }
    {
      key: '8:success',
      samples: [ { timestamp: 1658150058511, value: 16 } ]
    }
  */
