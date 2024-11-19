import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { corsOptions } from './config/corsOptions'
import { APIs_V1 } from './routes'
import connectDB from './config/db'

dotenv.config()
const START_SERVER = () => {
  const app = express()
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  app.use(cookieParser())
  app.use(cors(corsOptions))
  app.use(express.json())
  connectDB()
  app.use('/v1', APIs_V1)

  const LOCAL_DEV_APP_PORT = 8017
  const LOCAL_DEV_APP_HOST = 'localhost'
  app.listen(LOCAL_DEV_APP_PORT, LOCAL_DEV_APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Local DEV: Hello, Back-end Server is running successfully at Host: ${LOCAL_DEV_APP_HOST} and Port: ${LOCAL_DEV_APP_PORT}`
    )
  })
};

(async () => {
  try {
    // eslint-disable-next-line no-console
    console.log('Starting Server...')
    START_SERVER()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(0)
  }
})()
