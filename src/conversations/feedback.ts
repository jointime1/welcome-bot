import type { Conversation } from "@grammyjs/conversations";
import { db, type MyContext } from "index";
import { onboardingMenu } from "menus/onboarding.menu";

export async function feedback(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  await ctx.reply(
    "Пожалуйста, напишите ваш отзыв или вопрос в следующем сообщении"
  );

  let state = true;
  let msg;

  while (state) {
    const { message: userMessage } = await conversation.waitFor("message:text");

    await ctx.reply("Вы уверены в правильности введенного отзыва?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Да", callback_data: "confirm_yes" }],
          [{ text: "Нет", callback_data: "confirm_no" }],
        ],
      },
    });
    const cq = await conversation.waitFor("callback_query:data");
    const callbackData = cq.callbackQuery.data;
    console.log(callbackData);

    if (callbackData === "confirm_yes") {
      msg = userMessage;
      state = false;
    } else {
      await ctx.reply("🔄 Пожалуйста, напишите ваш отзыв заново:");
    }
  }

  if (!ctx.from) {
    await ctx.reply("Не удалось определить отправителя сообщения.");
    return;
  }

  try {
    await db
      .insertInto("feedback")
      .values({
        message: msg?.text || "",
        userId: ctx.from.id.toString(),
        username: ctx.from.username,
        createdAt: new Date().toISOString(),
      })
      .execute();
    await ctx.reply("✅ Отзыв принят! Спасибо за ваше мнение!");
  } catch (error) {
    await ctx.reply("Произошла ошибка при сохранении отзыва");
  }
}
