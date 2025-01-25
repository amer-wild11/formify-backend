import { getUserById } from "~/server/db/user";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {};

  const user = await getUserById(id);
  if (!user) {
    return sendError(
      event,
      createError({ statusCode: 404, statusMessage: "User not found!" })
    );
  }
  return user;
});
