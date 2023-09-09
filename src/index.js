const dotenv = require('dotenv')
const express = require('express')
const process = require('process')
const { queueScheduler } = require('rxjs')
const { createPost, sendTelegramNotification } = require('./service')
const { authorize } = require('./middleware')

dotenv.config()

const app = express()

app.get('/', (req, res) => {
    res.json({
        message: 'GPT Post Writer'
    })
})

app.post('/create-post', authorize, (req, res) => {

    queueScheduler.schedule(() => {
        createPost()
    })

    sendTelegramNotification('Creating post started at ' + new Date().toISOString())
    res.json({
        message: 'Creating post...'
    })
})

module.exports = app