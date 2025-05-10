// config/db.js
const { Sequelize } = require('sequelize');

class Database {
  constructor() {
    if (!Database.instance) {
      this.sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: process.env.NODE_ENV === 'production' // Only disable in development
          }
        },
        pool: {
          max: process.env.NODE_ENV === 'production' ? 2 : 5,
          min: 0,
          idle: 10000,
          acquire: 30000,
          // Add connection retry on failure
          retry: {
            match: [
              /SequelizeConnectionError/,
              /SequelizeConnectionRefusedError/,
              /SequelizeHostNotFoundError/,
              /SequelizeHostNotReachableError/,
              /SequelizeInvalidConnectionError/,
              /SequelizeConnectionTimedOutError/,
              /TimeoutError/
            ],
            max: 3
          }
        },
        logging: process.env.NODE_ENV !== 'production' ? console.log : false
      });

      Database.instance = this;
    }

    return Database.instance;
  }

  async testConnection(retries = 3, delay = 5000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.sequelize.authenticate();
        console.log('PostgreSQL DB connected successfully via Sequelize');
        return true;
      } catch (err) {
        console.error(`DB connection attempt ${attempt} failed:`, err.message);
        
        if (attempt === retries) {
          console.error('Max retries reached. Could not establish database connection');
          return false;
        }

        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return false;
  }

  getInstance() {
    return this.sequelize;
  }
}

// Create a singleton instance
const database = new Database();

module.exports = database.getInstance();
module.exports.testConnection = database.testConnection.bind(database);
