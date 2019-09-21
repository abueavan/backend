//  only imports the actual application from the app.js file and then starts the application
const app = require('./app') // the actual Express app
const http = require('http')
const config = require('./utils/config')

const sever = http.createServer(app)

sever.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})
