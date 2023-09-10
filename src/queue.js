const Queue = require('bull')
const { createPost } = require('./service')

const createPostQueue = new Queue('create-post', process.env.REDIS_URL)

createPostQueue.process(async (job, done) => {
    console.log('Creating post...')
    await createPost()
    done()
})

module.exports = {
    createPostQueue
}

