const dotenv = require('dotenv')
const express = require('express')
const { sendTelegramNotification } = require('./service')
const { authorize } = require('./middleware')
const { createPostQueue } = require('./queue')

dotenv.config()

const app = express()

app.get('/', (req, res) => {
    res.json({
        message: 'GPT Post Writer'
    })
})

app.post('/create-post', authorize, async (req, res) => {
    await createPostQueue.add({})
    await sendTelegramNotification('Creating post started at ' + new Date().toISOString())
    res.json({
        message: 'Creating post...'
    })
})

module.exports = app