import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const documentClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
 
  const updateTodoParams = {
    TableName: todosTable,
    Key: {
      "todoId": todoId
    },
    UpdateExpression: "set #n = :name, dueDate = :dueDate, done = :done",
    ExpressionAttributeValues: {
      ":name": updatedTodo['name'],
      ":dueDate": updatedTodo.dueDate,
      ":done": updatedTodo.done
    },
    ExpressionAttributeNames: {
      "#n": "name"
    },
    ReturnValues: "UPDATED"
  }

  const updated = await documentClient.update(updateTodoParams).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      updated
    })
  }
}