'use strict'

const co = require('co')
const AWS = require('aws-sdk')
AWS.config.region = 'us-east-1'
const dynamodb = new AWS.DynamoDB.DocumentClient()
const chance = require('chance').Chance()

const stage = process.env.TEST_DB || 'dev'

const getUsers = (n = 1) => Array.apply(null, { length: n }).map(u => ({
  name: chance.name(),
  lastName: chance.email(),
  id: chance.guid(),
  email: chance.email()
}))

const getOrders = (email, n = 10) => Array.apply(null, { length: n }).map(u => ({
  id: chance.name(),
  email,
  comment: chance.sentence(),
  createdAt: chance.timestamp()
}))

const writeBatchToDynamodb = co.wrap(function * ({data, db}) {
  let putReq = data.map(i => ({
    PutRequest: {
      Item: i
    }
  }))
  let req = {
    RequestItems: {
      [`${stage}_${db}`]: putReq
    }
  }
  yield dynamodb.batchWrite(req).promise()
    .then(() => console.log('Copy Temp Orders to Dynamodb'))
    .catch(e => {
      throw new Error('Error writing batch to dynamo', e.message)
    })
})

const deleteBatchFromDynamodb = co.wrap(function * ({data, db, key = 'id'}) {
  try {
    let putReq = data.map(i => ({
      DeleteRequest: {
        Key: {
          [`${key}`]: i[key]
        }
      }
    }))
    let req = {
      RequestItems: {
        [`${stage}_${db}`]: putReq
      }
    }
    yield dynamodb.batchWrite(req).promise()
      .then(() => console.log('Deleted Temp Orders to Dynamodb'))
  } catch (e) {
    throw new Error('Error deleting batch to dynamo', e.message)
  }
})

module.exports = {
  getUsers,
  getOrders,
  writeBatchToDynamodb,
  deleteBatchFromDynamodb
}
