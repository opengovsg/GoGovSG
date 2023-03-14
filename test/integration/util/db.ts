import Sequelize from 'sequelize'
import { DB_URI } from '../config'

const sequelize = new Sequelize.Sequelize(DB_URI, {
  dialect: 'postgres',
  timezone: '+08:00',
})

export const createDbUser = async (email: string): Promise<void> => {
  try {
    // Create integration test user with given email
    await sequelize.query(
      `
      INSERT INTO users ("email", "createdAt", "updatedAt") SELECT :email, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT * FROM users WHERE "email"=:email);
    `,
      { replacements: { email } },
    )
  } catch (e) {
    throw new Error(
      `Failed to create user with email ${email} for integration tests: ${e.message}`,
    )
  }
}

export const deleteDbUser = async (email: string): Promise<void> => {
  try {
    await sequelize.query(
      `
      BEGIN TRANSACTION;

      -- Delete all URLs belonging to integration test user
      DELETE FROM urls
      USING users
      WHERE urls."userId" = users."id"
      AND users."email" = :email;

      -- Delete integration test user
      DELETE FROM users WHERE "email" = :email;

      COMMIT;
    `,
      {
        replacements: { email },
      },
    )
  } catch (e) {
    throw new Error(
      `Failed to delete user with email ${email} for integration tests: ${e.message}`,
    )
  }
}
