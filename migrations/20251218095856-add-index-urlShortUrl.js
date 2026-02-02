/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });.
     */

    await queryInterface.addIndex('url_histories', ['urlShortUrl'], {
      concurrently: true,
    })
  },

  async down(queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');.
     */
    await queryInterface.removeIndex('url_histories', ['urlShortUrl'])
  },
}
