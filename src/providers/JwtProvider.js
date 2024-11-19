import JWT from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife
    })
  } catch (error) {
    throw new Error(error)
  }
}

const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const ACCESS_TOKEN_SECRET_SIGNATURE = process.env.JWT_SECRET
export const REFRESH_TOKEN_SECRET_SIGNATURE = process.env.REFRESH_TOKEN_SECRET

export const JWTProvider = {
  generateToken,
  verifyToken
}
