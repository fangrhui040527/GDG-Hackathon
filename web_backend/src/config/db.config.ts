import { Connector, IpAddressTypes } from "@google-cloud/cloud-sql-connector";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const dbHost = process.env.DATABASE_HOST ?? process.env.DB_HOST;
const dbPort = process.env.DATABASE_PORT ?? process.env.DB_PORT;
const dbUser = process.env.DATABASE_USER ?? process.env.DB_USER;
const dbPassword = process.env.DATABASE_PASSWORD ?? process.env.DB_PASSWORD;
const dbName = process.env.DATABASE_NAME ?? process.env.DB_NAME;

const instanceConnectionName = process.env.CLOUD_SQL_CONNECTION_NAME;

if (!connectionString && !dbHost && !instanceConnectionName) {
  throw new Error(
    "Database config missing. Set CLOUD_SQL_CONNECTION_NAME, DATABASE_URL, or DATABASE_HOST/DATABASE_USER/DATABASE_PASSWORD/DATABASE_NAME.",
  );
}

if (instanceConnectionName && (!dbUser || !dbPassword || !dbName)) {
  throw new Error(
    "Cloud SQL connector requires DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME.",
  );
}

let connector: Connector | null = null;

const pool = instanceConnectionName
  ? new Pool(
      await (async () => {
        connector = new Connector();
        const ipType: IpAddressTypes = IpAddressTypes.PUBLIC;
        const opts = await connector.getOptions({
          instanceConnectionName,
          ipType
        });

        return {
          ...opts,
          user: dbUser,
          password: dbPassword,
          database: dbName,
        };
      })(),
    )
  : new Pool(
      connectionString
        ? { connectionString }
        : {
            host: dbHost,
            port: dbPort ? Number(dbPort) : undefined,
            user: dbUser,
            password: dbPassword,
            database: dbName,
          },
    );

export const closeDb = async (): Promise<void> => {
  await pool.end();
  connector?.close();
};
export { pool };
