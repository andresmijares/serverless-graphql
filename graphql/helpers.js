'use strict'
const co = require('co')
const AWS = require('aws-sdk')
AWS.config.region = 'us-east-1'
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const tableOrders = process.env.tableOrders
const tableUsers = process.env.tableUsers

const getUsersPerOder = co.wrap(function * (email) {
  console.log('email', email)
  try {
    let ordersParams = {
      TableName: tableOrders,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }
    let userParams = {
      TableName: tableUsers,
      Key: {
        email
      }
    }
    // SCAN is the least ideal... you should try to avoid it
    const [user, orders] = yield [
      dynamoDB.get(userParams).promise(),
      dynamoDB.scan(ordersParams).promise()
    ]

    console.log(user, orders)

    const userBySchema = Object.assign({}, user.Item, {
      orders: orders.Items
    })

    console.log(userBySchema)
    return userBySchema
  } catch (e) {
    console.log(e.message)
  }
})

module.exports = {
  getUsersPerOder
}
