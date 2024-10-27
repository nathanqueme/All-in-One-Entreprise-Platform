//
//  Server.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/03/22
//

import express, { Express, Request, Response } from 'express'
import serveStatic from 'serve-static'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'; dotenv.config()
import { accountsMainDataRouter, authRouter, locationRouter, postCategoriesRouter, postsRouter, profilesRouter, relatedItemsRouter, searchRouter, storageRouter, translateRouter, analyticsRouter, atagRouter } from './routes'


const { PORT = 8000 } = process.env
const app: Express = express()
app.use(express.json({ limit: '25mb' }))
app.use(cookieParser())


const serveStaticOptions : serveStatic.ServeStaticOptions = {
    dotfiles: "ignore", 
    index: false
}
app.use(express.static(__dirname + '/static', serveStaticOptions))


var allowedOrigins = [
  'http://localhost:3000', 'http://localhost:3001',
  'https://app-tests-ae4c2.web.app', // Tests (Firebase)
  'https://atsight.ch', '/\.atsight\.ch$/', 'https://www.atsight.ch', 'https://about.atsight.ch', 
  'https://atsight.fr', '/\.atsight\.fr$/', 'https://www.atsight.fr'
]
app.use(cors({
  origin: function (origin, callback) {
   
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) === -1) {
      // 'The CORS policy for this site does not allow access from the specified Origin.'
      return callback(null, false)
    }
    return callback(null, true)
    
  },
  credentials: true // when enabled, people can se the sent cookies in the request headers in their browser
}))
// Makes the web server forward client's ip address to the express app so it can be accessed. (See "analytics/init")
app.set('trust proxy', '127.0.0.1')
app.get('/', (req: Request, res: Response) => {
  res.json("AtSight's apis")
})



// HIDDEN : indicates that the resources are not accessible to users.


// DATABASE
//
app.use('/accounts_main_data', accountsMainDataRouter)
app.use('/post_categories', postCategoriesRouter)
app.use('/posts', postsRouter)
app.use('/profiles', profilesRouter)
app.use('/related_items', relatedItemsRouter)
//
app.use('/search', searchRouter)
// ANALYTICS & DATA
app.use('/atag', atagRouter)                          // HIDDEN + could be used for other brands as a service / an other API 
app.use('/analytics', analyticsRouter)                // HIDDEN
// app.use('/searchHistory', searchHistoryRouter)     
// app.use('/seenPosts', seenPostsRouter)             // HIDDEN
// app.use('/seenAccounts', seenAccountsRouter)       // HIDDEN 


// STORAGE
//
app.use('/storage', storageRouter)


// UTILITIES
// 
app.use('/auth', authRouter)
app.use('/translate', translateRouter)
app.use('/location', locationRouter)





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
