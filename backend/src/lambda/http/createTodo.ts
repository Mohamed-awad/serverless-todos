import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { parseUserId } from '../../auth/utils'

const documentClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Implement creating a new TODO item

  const todoId = uuid.v4()
  const parsedBody = JSON.parse(event.body)
  const authHeader = event.headers.Authorization
  const authSplit = authHeader.split(" ")
  const token = authSplit[1]

  const newTodo = {
    todoId: todoId,
    userId: parseUserId(token),
    ...parsedBody
  }

  await documentClient.put({
    TableName: todosTable,
    Item: newTodo
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newTodo
    })
  }
}
