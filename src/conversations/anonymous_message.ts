import type { Conversation } from "@grammyjs/conversations";
import { db, type MyContext } from "index";

const CONVERSATION_ID = -1002252250331;

export async function anonymousMessage(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  // Проверка, что пользователь авторизован
  if (!ctx.from) {
    await ctx.reply("❌ Ошибка: не удалось определить вашу учетную запись.");
    return;
  }

  // Проверка, что пользователь является участником целевой беседы
  try {
    const chatMember = await ctx.api.getChatMember(
      CONVERSATION_ID,
      ctx.from.id
    );

    // Если пользователь не является участником, завершаем выполнение
    if (
      chatMember.status === "left" ||
      chatMember.status === "kicked" ||
      chatMember.status === "restricted"
    ) {
      await ctx.reply(
        "❌ Вы не являетесь участником беседы IT-X: Новички в IT. Команда недоступна."
      );
      return;
    }
  } catch (error) {
    console.error("Ошибка при проверке участника беседы:", error);
    await ctx.reply("❌ Ошибка при проверке вашего доступа к беседе.");
    return;
  }

  // Запрос анонимного сообщения
  await ctx.reply(
    `Пожалуйста, напишите ваше анонимное сообщение в следующем сообщении. Оно будет отправлено в беседу анонимно.
Данный функционал, создан для новичков, чтобы не было страха "тупого вопроса". Поэтому используйте эту функцию по назначению!    
    `
  );

  let state = true;
  let msg;

  while (state) {
    const { message: userMessage } = await conversation.waitFor("message:text");

    // Подтверждение отправки
    await ctx.reply(
      "Вы уверены, что хотите отправить это анонимное сообщение?",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Да", callback_data: "confirm_yes" }],
            [{ text: "Нет", callback_data: "confirm_no" }],
          ],
        },
      }
    );

    const cq = await conversation.waitFor("callback_query:data");
    const callbackData = cq.callbackQuery.data;

    if (callbackData === "confirm_yes") {
      msg = userMessage;
      state = false;
    } else {
      await ctx.reply("🔄 Пожалуйста, напишите ваше сообщение заново:");
    }
  }

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

    // Сохранение анонимного сообщения в базу данных
    await db
      .insertInto("anonymous_message")
      .values({
        user_id: user.id, // Используем найденный или созданный user_id
        username: ctx.from.username || "",
        message: msg?.text || "",
        created_at: new Date().toISOString(),
      })
      .execute();

    // Попытка отправить сообщение в целевую беседу
    try {
      await ctx.api.sendMessage(
        CONVERSATION_ID,
        `📝 Анонимное сообщение:\n\n${msg?.text || ""}`
      );
      await ctx.reply(
        "✅ Ваше анонимное сообщение успешно отправлено в беседу!"
      );
    } catch (sendError) {
      console.error("Ошибка при отправке сообщения в беседу:", sendError);
      await ctx.reply(
        "✅ Сообщение сохранено, но его отправка в беседу не удалась. Администраторы обработают его позже."
      );
    }
  } catch (error) {
    console.error("Ошибка при сохранении анонимного сообщения:", error);
    await ctx.reply("❌ Произошла ошибка при сохранении сообщения");
  }
}
