import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
// import { decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

import * as middy from 'middy';
// import { secretsManager } from 'middy/middlewares';

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJdKdEgbIECkOeMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi01bnBpbWFvdy5hdXRoMC5jb20wHhcNMTkxMjE5MjA1ODAxWhcNMzMw
ODI3MjA1ODAxWjAhMR8wHQYDVQQDExZkZXYtNW5waW1hb3cuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzvTOcDnhQ8bpk76prEAsCgrl
qNAVhMpbVZKFwKC6f3xAuvt9w9Cy8RyGZMZnYxU7EySzC9C4N3Cv8x+CpuXlCD4W
0IVd1w4gtvCQimQvS+AFoD0oZLq1DOYhJMwJEuiG+P06mk3cqag4WsJBbA3QoGeH
qeZyzEVKFZCIcHyV9so0OdeILCCU6e6E95CKFM9GYxSQW1vNhGEUSJrv8f7CpPXL
VwjY8L0yc0y0ELHcYR5uS2khcsxkyAlVroTPScc4fS/qCZ6FQgaT6uk2Bc82a4/l
cNylOxsdX60IeHhyPLdyLmGpoK09SVUDsr4hagguyMStBcF6vMZp3J8tU4h1awID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRIIkG8lM8l2zALg+ow
LktQGQNJ2TAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAHIDSVpj
V7Cm1lgPfzQsfd8Xy+8zxIXmSzAixVh3IpznRY387pSJ09bpsv/wKMAk/zYblaSi
w8lb/QqETq/QwC5xHKnsswsVrlvrxQLeMy7Cjeg1nqkHn22oenQUXBKcIk2e7pB6
xc2XzVMRwJtGUzAEC9YzMyf6HlnKfnjYRVYUxiccSXoyOL9pQIJrlLMTAAuoec6z
GcWVSuFRR2GNX09wlifthI1NRtCOeR4OwRJw8mgfHRqHxc3+M6ZbsZdxb0nnHTD/
6HfcRohz6VFicqIM93drKJx53jLAnRFEjsBiXKvC9xSHSCS1A9Qx9KCbVR22mh8U
XAAJgvY7AlDtuYE=
-----END CERTIFICATE-----
`

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'

export const handler = middy(async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
})

// const authSecret = process.env.AUTH_0_SECRET

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token,cert, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
