import type { Conversation } from "@grammyjs/conversations";
import { db, type MyContext } from "index";

export async function createEvent(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  // Check if user is admin
  const ADMIN_IDS: number[] = [931916742]; // This should match the admin IDs in index.ts
  if (!ADMIN_IDS.includes(ctx.from?.id || 0)) {
    await ctx.reply("Только администраторы могут добавлять события");
    return;
  }

  // Step 1: Ask for event name
  await ctx.reply("Пожалуйста, введите название мероприятия:");
  const { message: nameMsg } = await conversation.waitFor("message:text");
  const eventName = nameMsg.text;

  // Step 2: Ask for event date
  await ctx.reply(
    "Введите дату мероприятия в формате YYYY-MM-DD (например, 2025-03-15):"
  );
  
  let eventDate: Date | null = null;
  while (!eventDate) {
    const { message: dateMsg } = await conversation.waitFor("message:text");
    try {
      eventDate = new Date(dateMsg.text);
      // Check if date is valid
      if (isNaN(eventDate.getTime())) {
        await ctx.reply(
          "Неверный формат даты. Пожалуйста, используйте формат YYYY-MM-DD:"
        );
        eventDate = null;
      }
    } catch (error) {
      await ctx.reply(
        "Произошла ошибка при обработке даты. Пожалуйста, используйте формат YYYY-MM-DD:"
      );
      eventDate = null;
    }
  }

  // Step 3: Ask for event description
  await ctx.reply("Введите описание мероприятия:");
  const { message: descMsg } = await conversation.waitFor("message:text");
  const eventDescription = descMsg.text;

  // Step 4: Confirm event details
  await ctx.reply(
    `Пожалуйста, проверьте детали мероприятия:\n\n` +
    `📅 Название: ${eventName}\n` +
    `📆 Дата: ${eventDate.toLocaleDateString()}\n` +
    `📝 Описание: ${eventDescription}\n\n` +
    `Все верно?`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Да, создать мероприятие", callback_data: "create_yes" }],
          [{ text: "Нет, отменить", callback_data: "create_no" }],
        ],
      },
    }
  );

  // Step 5: Process confirmation
  const cq = await conversation.waitFor("callback_query:data");
  const callbackData = cq.callbackQuery.data;
  
  if (callbackData === "create_yes") {
    try {
      await db
        .insertInto("event")
        .values({
          name: eventName,
          date: eventDate.toISOString(),
          description: eventDescription,
        })
        .execute();
      
      await ctx.reply("✅ Мероприятие успешно создано!");
      
      // Notify about successful creation
      await ctx.answerCallbackQuery("Мероприятие создано успешно!");
    } catch (error) {
      console.error("Error creating event:", error);
      await ctx.reply("❌ Произошла ошибка при создании мероприятия.");
      await ctx.answerCallbackQuery("Ошибка при создании мероприятия");
    }
  } else {
    await ctx.reply("🚫 Создание мероприятия отменено.");
    await ctx.answerCallbackQuery("Создание мероприятия отменено");
  }
}
