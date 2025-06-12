require('dotenv').config()

const config = {
    development: {
        databaseUrl: process.env.DATABASE_URL
    }

}

const environment = process.env.NODE_ENV || 'development'

module.exports = config[environment]