// src/knexfile.js
export default {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/db/migrations', // Adjusted to match the location of migrations inside 'src/db'
  },
  seeds: {
    directory: './src/db/seeds', // Adjusted to match the location of seeds inside 'src/db'
  },
};
