/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Enable pg_trgm extension if not already enabled
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `)

    // Create trigram index on users.email for efficient LIKE '%...' queries
    // CONCURRENTLY cannot run inside a transaction
    await queryInterface.sequelize.query(
      `
      CREATE INDEX CONCURRENTLY idx_users_email_trgm
      ON users USING gin (email gin_trgm_ops);
      `,
      { transaction: null },
    )
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `
      DROP INDEX CONCURRENTLY IF EXISTS idx_users_email_trgm;
      `,
      { transaction: null },
    )
  },
}
