/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Create descending index on urls.createdAt for efficient sorting
    // CONCURRENTLY cannot run inside a transaction
    await queryInterface.sequelize.query(
      `
      CREATE INDEX CONCURRENTLY idx_urls_created_at_desc
      ON urls ("createdAt" DESC);
      `,
      { transaction: null },
    )
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `
      DROP INDEX CONCURRENTLY IF EXISTS idx_urls_created_at_desc;
      `,
      { transaction: null },
    )
  },
}
