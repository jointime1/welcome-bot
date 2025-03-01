import { Bot, Context, session } from "grammy";
import { createDataSource } from "./database";
import { logger } from "./logger";
import {
  conversations,
  createConversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";
import { feedback } from "./conversations/feedback";
import { onboarding } from "conversations/onboarding";
import { createEvent } from "./conversations/create_event";
import { anonymousMessage } from "./conversations/anonymous_message";
import { mainMenu, showMainMenu } from "menus/onboarding.menu";
import { adminMenu, showAdminMenu } from "menus/admin.menu";

export type MyContext = Context &
  ConversationFlavor<Context> & { session: { onboardingIndex: number } };

export const bot = new Bot<MyContext>(process.env.BOT_TOKEN || "");
export const db = createDataSource({ logger });

bot.use(conversations());
bot.use(session({ initial: () => ({ onboardingIndex: 0 }) }));

bot.use(createConversation<MyContext, MyContext>(feedback));
bot.use(createConversation<MyContext, MyContext>(onboarding));
bot.use(createConversation<MyContext, MyContext>(createEvent));
bot.use(createConversation<MyContext, MyContext>(anonymousMessage));

bot.use(mainMenu);
bot.use(adminMenu);

//Middleware для проверки типа чата
bot.use(async (ctx, next) => {
  if (ctx.chat?.type !== "private") {
    return;
  }
  await next();
});

const ADMIN_IDS: number[] = [931916742];

bot.command("menu", async (ctx) => {
  await showMainMenu(ctx);
});

bot.command("chat_id", async (ctx) => {
  await ctx.reply(ctx.chat.id.toString());
});

bot.command("anonymous", async (ctx) => {
  await ctx.conversation.enter("anonymousMessage");
});

bot.command("admin", async (ctx) => {
  await showAdminMenu(ctx);
});

bot.command("start", async (ctx) => {
  await ctx.conversation.enter("onboarding");
});

bot.command("add_event", async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from?.id || 0)) {
    await ctx.reply("Только администраторы могут добавлять события");
    return;
  }

  if (!ctx.message || !ctx.message.text) {
    await ctx.reply("Сообщение не распознано. Пожалуйста, повторите попытку.");
    return;
  }

  const args = ctx.message.text.split("\n");
  if (args.length < 4) {
    await ctx.reply(
      "Формат: /add_event\nНазвание\nДата (YYYY-MM-DD)\nОписание"
    );
    return;
  }

  try {
    await db
      .insertInto("event")
      .values({
        id: 0,
        name: args[1],
        date: new Date(args[2]).toISOString(),
        description: args[3],
      })
      .execute();
    await ctx.reply("Событие успешно добавлено!");
  } catch (error) {
    await ctx.reply("Ошибка при добавлении события");
  }
});

bot.command("list_events", async (ctx) => {
  const events = await db
    .selectFrom("event")
    .selectAll()
    .orderBy("date", "asc")
    .execute();

  if (events.length === 0) {
    await ctx.reply("Нет запланированных мероприятий");
    return;
  }

  const eventsList = events
    .map(
      (e) => ` ${e.name}\n ${e.date.toLocaleDateString()}\n ${e.description}`
    )
    .join("\n\n");

  await ctx.reply(eventsList);
});

bot.command("view_feedback", async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from?.id || 0)) {
    await ctx.reply("Только администраторы могут просматривать обратную связь");
    return;
  }

  const feedback = await db
    .selectFrom("feedback")
    .selectAll()
    .orderBy("created_at", "desc")
    .execute();

  if (feedback.length === 0) {
    await ctx.reply("Нет новых сообщений");
    return;
  }

  const feedbackList = feedback
    .map(
      (f) =>
        `От: ${f.username || f.user_id}\n ${
          f.message
        }\n ${f.created_at.toLocaleDateString()}`
    )
    .join("\n\n");

  await ctx.reply(feedbackList);
});

bot.command("create_event", async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from?.id || 0)) {
    await ctx.reply("Только администраторы могут создавать события");
    return;
  }
  await ctx.conversation.enter("createEvent");
});

bot.command("feedback", async (ctx) => {
  await ctx.conversation.enter("feedback");
});

bot.command("cancel", async (ctx) => {
  await ctx.conversation.exitAll();
});

bot.catch((err) => {
  console.error("Ошибка в боте:", err);
});

bot.start();
console.log("Bot started!");
