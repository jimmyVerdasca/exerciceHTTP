module.exports = {
    port: process.env.PORT,
    url: process.env.URL,
    dbname: process.env.DBNAME,
    dblink: process.env.DBLINK,
    jwtOptions: {
        secret: process.env.JWT_SECRET
    }
}