/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Create descending index on url_clicks.clicks for efficient sorting by popularity
    // CONCURRENTLY cannot run inside a transaction
    await queryInterface.sequelize.query(
      `
      CREATE INDEX CONCURRENTLY idx_url_clicks_clicks_desc
      ON url_clicks (clicks DESC);
      `,
      { transaction: null },
    )
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `
      DROP INDEX CONCURRENTLY IF EXISTS idx_url_clicks_clicks_desc;
      `,
      { transaction: null },
    )
  },
}
