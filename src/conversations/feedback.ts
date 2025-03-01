import type { Conversation } from "@grammyjs/conversations";
import { db, type MyContext } from "index";

export async function feedback(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  // Проверка, что пользователь авторизован
  if (!ctx.from) {
    await ctx.reply("❌ Ошибка: не удалось определить вашу учетную запись.");
    return;
  }

  // Запрос обратной связи
  await ctx.reply("Пожалуйста, напишите ваше сообщение с обратной связью.");

  const { message: userMessage } = await conversation.waitFor("message:text");

  try {
    // Поиск пользователя в базе данных по tg_id
    let user = await db
      .selectFrom("users")
      .select("id")
      .where("tg_id", "=", ctx.from.id)
      .executeTakeFirst();

    if (!user) {
      // Если пользователь не найден, создаем его
      const newUser = await db
        .insertInto("users")
        .values({
          tg_id: ctx.from.id,
          tg_username: ctx.from.username || "",
          first_name: ctx.from.first_name,
          last_name: ctx.from.last_name || null,
          created_at: new Date().toISOString(),
        })
        .returning("id")
        .executeTakeFirst();

      if (!newUser) {
        await ctx.reply("❌ Ошибка: не удалось создать вашу учетную запись.");
        return;
      }

      user = newUser;
    }

    // Сохранение обратной связи в базу данных
    await db
      .insertInto("feedback")
      .values({
        message: userMessage.text,
        user_id: user.id, // Используем найденный или созданный user_id
        username: ctx.from.username || "",
        created_at: new Date().toISOString(),
      })
      .execute();

    await ctx.reply("✅ Ваше сообщение с обратной связью успешно отправлено!");
  } catch (error) {
    console.error("Ошибка при сохранении обратной связи:", error);
    await ctx.reply("❌ Произошла ошибка при сохранении вашего сообщения.");
  }
}