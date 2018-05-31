'use strict'

const { graphql } = require('graphql')
const { schema } = require('../graphql/schema')

/*
  * This method just parse the payload and check if it's a valid means
  * the user is using a GraphQL client.
*/

const validatePayload = (event) => {
  try {
    const body = JSON.parse(event)
    let query = body.query

    if (body.query && body.query.hasOwnProperty('query')) {
      query = body.query.query.replace('\n', ' ', 'g')
    }
    return query
  } catch (e) {
    return event // postman case
  }
}

module.exports.handler = (event, context, callback) => {
  const query = validatePayload(event.body)

  return graphql(schema, query)
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(res)
      })
    })
    .catch(e => {
      callback(e)
    })
}
