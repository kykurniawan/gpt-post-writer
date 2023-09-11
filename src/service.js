const { default: axios } = require('axios');
const { OpenAI } = require('openai');

const createPost = async (retry = 3) => {
    if (retry === 0) {
        await sendTelegramNotification('Retries exhausted at ' + new Date().toISOString())
        return
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORGANIZATION_ID
    });

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 1.2,
        messages: [
            {
                'role': 'system',
                'content': 'You are a blogger who wants to write a blog post about any topic.'
            },
            {
                'role': 'user',
                'content': 'Please write a blog post about any topic. The post should be at least 500 words long and should be written in a conversational tone. Please add a disclaimer section at the end of the post body, telling that this post is fully written by Chat GPT. Return the post as a JSON object with the title, content (in markdown), and tags with this format: { "title": "My Blog Post", "content": "This is my blog post.", "tags": [] }'
            },
        ]
    })

    try {
        await sendTelegramNotification('Got resonse from GPT, Try to parsing and sending to Hashnode...')
        const data = JSON.parse(completion.choices[0].message.content)

        const response = await axios.post('https://api.hashnode.com', {
            query: `
                mutation CreatePublicationStory($publicationId: String!, $input: CreateStoryInput!) {
                    createPublicationStory(publicationId: $publicationId, input: $input) {
                        code
                        message
                        success
                    }
                }
            `,
            variables: {
                publicationId: process.env.HASHNODE_PUBLICATION_ID,
                input: {
                    title: data.title,
                    contentMarkdown: data.content,
                    tags: [],
                    coverImageURL: 'https://source.unsplash.com/800x400/?' + data.tags.join(','),
                    isPartOfPublication: {
                        publicationId: process.env.HASHNODE_PUBLICATION_ID
                    }
                }
            }
        }, {
            headers: {
                Authorization: `${process.env.HASHNODE_PERSONAL_ACCESS_TOKEN}`
            }
        })

        if (response.status !== 200) {
            throw new Error('Error creating post')
        }
        
        await sendTelegramNotification('Post created at ' + new Date().toISOString() + ' with title: ' + data.title)
    } catch (e) {
        await sendTelegramNotification('Error creating post at ' + new Date().toISOString() + '. Error: ' + e.message + '. Retrying...')
        await createPost(retry - 1)
    }
}


const sendTelegramNotification = async (message) => {
    try {
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    } catch (e) {
        console.error('Error sending Telegram message', e)
    }
}

module.exports = {
    createPost,
    sendTelegramNotification
}