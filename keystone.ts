import { CartItem } from "./schemas/CartItem";
import { ProductImage } from "./schemas/ProductImage";
import { Product } from "./schemas/Product";
import { User } from "./schemas/User";
import "dotenv/config";
import { createAuth } from "@keystone-next/auth";
import { config, createSchema } from "@keystone-next/keystone/schema";
import {
  withItemData,
  statelessSessions
} from "@keystone-next/keystone/session";
import { insertSeedData } from "./seed-data";
import { sendPasswordResetEmail } from "./lib/mail";

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
  },
  passwordResetLink: {
    async sendToken(args) {
      await sendPasswordResetEmail(args.token, args.identity);
    }
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
      url: databaseURL,
      async onConnect(keystone) {
        if (process.argv.includes("--seed-data")) {
          await insertSeedData(keystone);
        }
      }
    },
    lists: createSchema({
      User,
      Product,
      ProductImage,
      CartItem
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
