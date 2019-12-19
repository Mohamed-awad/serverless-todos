import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import 'source-map-support/register'
import { parseUserId } from '../../auth/utils'

const documentClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const authHeader = event.headers.Authorization
  const authSplit = authHeader.split(" ")
  const token = authSplit[1]

  const todos = await documentClient.scan({
    TableName: todosTable,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': parseUserId(token),
    },
  }).promise()
  const items = todos.Items
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
