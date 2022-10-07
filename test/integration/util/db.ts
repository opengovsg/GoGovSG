import Sequelize from 'sequelize'
import { DB_URI, EMAIL } from '../config'

const sequelize = new Sequelize.Sequelize(DB_URI, {
  dialect: 'postgres',
  timezone: '+08:00',
})

const clearDb = async (): Promise<void> => {
  try {
    await sequelize.query(
      `
      BEGIN TRANSACTION;

      -- Create integration test email if it does not exist
      INSERT INTO users ("email", "createdAt", "updatedAt") SELECT :email, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT * FROM users WHERE "email"=:email);

      -- Delete all URLs belonging to the integration test email
      DELETE FROM urls WHERE "userId" IN (SELECT id FROM users WHERE "email"=:email);

      COMMIT;
    `,
      { replacements: { email: EMAIL } },
    )
  } catch (e) {
    throw new Error(
      `Failed to clear database for integration tests: ${e.message}`,
    )
  }
}

export default clearDb
