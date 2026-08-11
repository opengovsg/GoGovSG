/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });.
     */
    await queryInterface.addColumn('urls', 'safeBrowsingExpiry', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    })
  },

  async down(queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');.
     */
    await queryInterface.removeColumn('urls', 'safeBrowsingExpiry')
  },
}
