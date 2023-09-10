const dotenv = require('dotenv')
const express = require('express')
const { sendTelegramNotification, createPost } = require('./service')
const { authorize } = require('./middleware')
const { queueScheduler } = require('rxjs')

dotenv.config()

const app = express()

app.get('/', (req, res) => {
    res.json({
        message: 'GPT Post Writer'
    })
})

app.post('/create-post', authorize, async (req, res) => {
    await sendTelegramNotification('Creating post started at ' + new Date().toISOString())
    queueScheduler.schedule(() => createPost())
    res.json({
        message: 'Creating post...'
    })
})

module.exports = app