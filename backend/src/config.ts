import { DataSource } from "typeorm";
import Ad from "./entity/ad";

const dataSource = new DataSource({
  type: "postgres",
  host: "db",
  port: 5432,
  username: "postgres",
  password: "example",
  database: "postgres",
  synchronize: true,
  logging: ["error"],
  entities: [Ad],
});

export default dataSource;
