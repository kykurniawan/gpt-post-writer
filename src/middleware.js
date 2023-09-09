const authorize = (req, res, next) => {
    const { authorization } = req.headers
    const [type, token] = authorization.split(' ')
    if(type !== 'Bearer') {
        res.status(401).json({
            message: 'Invalid authorization type'
        })
    }

    if (token === process.env.AUTHORIZATION_TOKEN) {
        next()
    } else {
        res.status(401).json({
            message: 'Unauthorized'
        })
    }
}

module.exports = {
    authorize
}