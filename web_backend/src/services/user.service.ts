import { pool } from "../config/db.config";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
};

export const findUserByEmail = async (
  email: string,
): Promise<UserRow | null> => {
  const result = await pool.query<UserRow>(
    "SELECT user_id AS id, email, password_hash FROM users_data WHERE email = $1 AND is_active = true",
    [email],
  );

  return result.rows[0] ?? null;
};

export const getUserRoles = async (userId: string): Promise<string[]> => {
  const result = await pool.query<{ name: string }>(
    "SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.roles_id WHERE ur.user_id = $1 ORDER BY r.name",
    [userId],
  );

  return result.rows.map((row) => row.name);
};

export const listRoles = async (): Promise<string[]> => {
  const result = await pool.query<{ name: string }>(
    "SELECT name FROM roles ORDER BY name",
  );

  return result.rows.map((row) => row.name);
};

type CreateUserInput = {
  email: string;
  passwordHash: string;
  roles?: string[];
};

export const createUser = async (input: CreateUserInput): Promise<UserRow> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const userResult = await client.query<UserRow>(
      "INSERT INTO users_data (email, password_hash) VALUES ($1, $2) RETURNING user_id AS id, email, password_hash",
      [input.email, input.passwordHash],
    );

    const user = userResult.rows[0];

    if (input.roles && input.roles.length > 0) {
      const roleResult = await client.query<{ id: number }>(
        "SELECT roles_id AS id FROM roles WHERE name = ANY($1)",
        [input.roles],
      );

      if (roleResult.rows.length > 0) {
        const values = roleResult.rows
          .map((row, index) => `($1, $${index + 2})`)
          .join(", ");
        const params = [user.id, ...roleResult.rows.map((row) => row.id)];
        await client.query(
          `INSERT INTO user_roles (user_id, role_id) VALUES ${values} ON CONFLICT DO NOTHING`,
          params,
        );
      }
    }

    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
