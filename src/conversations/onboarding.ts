import type { Conversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import type { MyContext } from "index";

export async function onboarding(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  // Определяем шаги онбординга
  const steps = [
    {
      text: `Добро пожаловать в наше сообщество! Я бот IT-ХОЗЯЕВ. Призван помочь вкатиться тебе по полной

Чтобы начать, нажми на кнопку ниже`,
      keyboard: new InlineKeyboard().text("Начать", "start"),
    },
    {
      text: `Отлично, тогда давай отправимся в путешествие по нашему сообществу!

Не беспокойся, если что-то забудешь. Всегда можно посмотреть список актуальных чатов по команде /menu

Первый чат - IT-ХОЗЯЕВА. Тут можно общаться на любые темы, даже не связанные с IT

Ты готов узнать про следующие сообщества?`,
      keyboard: new InlineKeyboard().text("Да", "ready"),
    },
    {
      text: `<b>Отлично!</b> Давай прокачаем тебя техническими знаниями. У нас в беседах куча сеньоров, готовых помочь.

В зависимости от уровня знаний вливайся в чаты:
<b>• IT-X: Новички в IT</b> - базовые вопросы
<b>• IT-X: IT (профильный)</b> - профессиональные обсуждения
<b>• IT-X: Технический книжный клуб</b> - еженедельные обсуждения книг

Советую вступить в чат твоей специализации:
<b>• IT-X: JS банда</b> - семинары по JavaScript
<b>• IT-X: Golang</b> - изучение Golang
<b>• IT-X: DevOps, linux, сети</b> - администрирование и сети`,
      parse_mode: "HTML",
      keyboard: new InlineKeyboard().text("Продолжить", "next"),
    },
    {
      text: `<b>IT-X: Материалы для обучения</b> - Сливы курсов и полезные ресурсы

Понимаю, что информация сложная, но это для твоего блага! Продолжаем?`,
      parse_mode: "HTML",
      keyboard: new InlineKeyboard().text("Далее", "next"),
    },
    {
      text: `<b>Чаттинг и отдых:</b>
<b>• IT-X: Спорт</b> - тренировки и питание
<b>• IT-X: Крипта и инвестиции</b> - финансовые обсуждения
<b>• IT-X: Москва</b> - местные встречи
<b>• IT-X: Аниме и манга</b> - аниме-сообщество
<b>• IT-X: Еда</b> - кулинарные шедевры
<b>• IT-X: Игры</b> - игровые сессии

Остался последний шаг! Завершаем?`,
      parse_mode: "HTML",
      keyboard: new InlineKeyboard().text("Завершить", "finish"),
    },
    {
      text: "🎉 Поздравляю! Ты завершил онбординг. Теперь ты полноправный участник нашего сообщества! Всегда можно вернуться к меню через /menu",
      keyboard: new InlineKeyboard(),
    },
  ];

  try {
    // Отправляем начальное сообщение
    const message = await ctx.reply(steps[0].text, {
      reply_markup: steps[0].keyboard,
      parse_mode: "HTML",
    });
    let currentStep = 0;

    // ... предыдущий код не меняется

    while (currentStep < steps.length - 1) {
      // Ждем действия пользователя и получаем полный объект callback query
      const result = await conversation.waitFor("callback_query:data");
      const callbackQuery = result.callbackQuery;

      // Обновляем шаг
      currentStep++;

      // Редактируем сообщение
      await ctx.api.editMessageText(
        ctx.chat!.id,
        message.message_id,
        steps[currentStep].text,
        {
          parse_mode: "HTML",
          reply_markup: steps[currentStep].keyboard,
        }
      );

      // Явно отвечаем на конкретный callback query
      await ctx.api.answerCallbackQuery(callbackQuery.id);
    }

    // ... остальной код
  } catch (error) {
    console.error("Ошибка в процессе онбординга:", error);
    await ctx.reply("Произошла ошибка, пожалуйста, попробуйте позже.");
  }
}
