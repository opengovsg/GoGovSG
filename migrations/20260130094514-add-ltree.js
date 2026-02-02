module.exports = {
  async up(queryInterface) {
    // Enable ltree extension
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS ltree;
    `)

    // Add the ltree column
    await queryInterface.sequelize.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS  email_domain_ltree ltree;
    `)

    // Populate the column
    await queryInterface.sequelize.query(`
        UPDATE users 
        SET email_domain_ltree = text2ltree(
          array_to_string(
            ARRAY(
              SELECT elem 
              FROM unnest(
                string_to_array(
                  regexp_replace(
                    substring(email from '@(.+)$'), 
                    '[^A-Za-z0-9_.]', 
                    '_', 
                    'g'
                  ),
                  '.'
                )
              ) WITH ORDINALITY AS t(elem, ord)
              ORDER BY ord DESC
            ),
            '.'
          )
        );
`)

    // Create GiST index
    await queryInterface.sequelize.query(
      `
      CREATE INDEX CONCURRENTLY idx_users_email_domain_ltree 
      ON users USING gist (email_domain_ltree);
    `,
      { transaction: null },
    )
  },

  async down(queryInterface) {
    // Drop the index
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_users_email_domain_ltree;
    `)

    // Drop the column
    await queryInterface.sequelize.query(`
      ALTER TABLE users DROP COLUMN IF EXISTS email_domain_ltree;
    `)

    // Optionally drop the extension (be careful if other tables use it)
    // await queryInterface.sequelize.query(`
    //   DROP EXTENSION IF EXISTS ltree;
    // `);
  },
}
