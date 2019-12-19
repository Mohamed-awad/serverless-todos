import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

const documentClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const s3Bucket = process.env.S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const todoId = event.pathParameters.todoId
  const imgId = uuid.v4()
  const s3 = new AWS.S3({
    signatureVersion: 'v4'
  })

  const url = s3.getSignedUrl('putObject', {
    Bucket: s3Bucket,
    Key: imgId,
    Expires: urlExpiration
  })

  const imgUrl = `https://${s3Bucket}.s3.amazonaws.com/${imgId}`

  const updateUrlOnTodo = {
    TableName: todosTable,
    Key: {
      "todoId": todoId
    },
    UpdateExpression: "set attachmentUrl = :imageUrl",
    ExpressionAttributeValues: {
      ":imageUrl": imgUrl
    },
    ReturnValues: "UPDATED"
  }

  await documentClient.update(updateUrlOnTodo).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      iamgeUrl: imgUrl,
      uploadUrl: url
    })
  }
}
