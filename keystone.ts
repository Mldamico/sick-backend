import { Product } from "./schemas/Product";
import { User } from "./schemas/User";
import "dotenv/config";
import { createAuth } from "@keystone-next/auth";
import { config, createSchema } from "@keystone-next/keystone/schema";
import {
  withItemData,
  statelessSessions
} from "@keystone-next/keystone/session";

const databaseURL =
  process.env.DATABASE_URL || "mongodb://localhost/keystone-sick-fits";

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, //tiempo que permanece logueado
  secret: process.env.COOKIE_SECRET
};

const { withAuth } = createAuth({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  initFirstItem: {
    fields: ["name", "email", "password"]
  }
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true
      }
    },
    db: {
      adapter: "mongoose",
      url: databaseURL
    },
    lists: createSchema({
      User,
      Product
    }),
    ui: {
      isAccessAllowed: ({ session }) => {
        return !!session?.data;
      }
    },
    session: withItemData(statelessSessions(sessionConfig), {
      User: `id`
    })
  })
);
