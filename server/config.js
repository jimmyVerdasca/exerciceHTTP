module.exports = {
    port: process.env.PORT,
    jwtOptions: {
        secret: process.env.JWT_SECRET
    }
}