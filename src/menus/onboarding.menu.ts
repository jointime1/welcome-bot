import { Menu } from "@grammyjs/menu";
import type { MyContext } from "index";

// Создаем подменю для каждой категории
// Подменю для технических чатов
const technicalMenu = new Menu<MyContext>("technical-menu")
  .text("IT-X: Новички в IT", async (ctx) => {
    await ctx.editMessageText(
      "Чат для тех, кто только начинает свой путь в IT. Задавайте вопросы, делитесь опытом"
    );
  })
  .text("IT-X: Профильный чат", async (ctx) => {
    await ctx.editMessageText(
      "Специализированный чат для обсуждения профессиональных IT-тем"
    );
  })
  .row()
  .text("JS банда", async (ctx) => {
    await ctx.editMessageText(
      "Сообщество JavaScript разработчиков. Обсуждаем фреймворки, библиотеки и лучшие практики"
    );
  })
  .text("Golang", async (ctx) => {
    await ctx.editMessageText(
      "Чат для обсуждения языка Go, его экосистемы и применения"
    );
  })
  .row()
  .text("DevOps", async (ctx) => {
    await ctx.editMessageText(
      "Сообщество для обсуждения DevOps-практик, инструментов и технологий"
    );
  })
  .text("Технический книжный клуб", async (ctx) => {
    await ctx.editMessageText(
      "Обсуждаем технические книги, делимся рекомендациями и инсайтами"
    );
  })
  .row()
  .text("« Назад", async (ctx) => {
    await ctx.editMessageText("Выберите категорию:", {
      reply_markup: mainMenu,
    });
  });

// Подменю для обучения
const educationMenu = new Menu<MyContext>("education-menu")
  .text("Материалы для обучения", async (ctx) => {
    await ctx.editMessageText(
      "Подборка полезных ресурсов, курсов и материалов для самообучения"
    );
  })
  .text("Митапы и конференции", async (ctx) => {
    await ctx.editMessageText(
      "Информация о предстоящих и прошедших IT-событиях, митапах и конференциях"
    );
  })
  .row()
  .text("Карьерный рост", async (ctx) => {
    await ctx.editMessageText(
      "Советы по построению карьеры в IT, обсуждение вакансий и требований работодателей"
    );
  })
  .row()
  .text("« Назад", async (ctx) => {
    await ctx.editMessageText("Выберите категорию:", {
      reply_markup: mainMenu,
    });
  });

// Подменю для чилл-чатов
const chillMenu = new Menu<MyContext>("chill-menu")
  .text("Спорт и здоровье", async (ctx) => {
    await ctx.editMessageText(
      "Обсуждаем спорт, фитнес, здоровый образ жизни и правильное питание"
    );
  })
  .text("Крипта и инвестиции", async (ctx) => {
    await ctx.editMessageText(
      "Чат для обсуждения криптовалют, инвестиций и финансовых стратегий"
    );
  })
  .row()
  .text("Москва: Сходки", async (ctx) => {
    await ctx.editMessageText(
      "Организация и анонсы офлайн-встреч сообщества в Москве"
    );
  })
  .row()
  .text("Аниме", async (ctx) => {
    await ctx.editMessageText(
      "Чат для любителей аниме, обсуждаем любимые тайтлы и новинки"
    );
  })
  .text("Еда", async (ctx) => {
    await ctx.editMessageText(
      "Делимся кулинарными рецептами, обсуждаем рестораны и кафе"
    );
  })
  .row()
  .text("Игры", async (ctx) => {
    await ctx.editMessageText(
      "Обсуждение игр всех жанров и платформ, ищем тиммейтов"
    );
  })
  .row()
  .text("« Назад", async (ctx) => {
    await ctx.editMessageText("Выберите категорию:", {
      reply_markup: mainMenu,
    });
  });

// Основное меню
export const mainMenu = new Menu<MyContext>("main-menu")
  .text("Технические чаты", async (ctx) => {
    await ctx.editMessageText(
      "<b>Технические направления:</b>\n\nВыберите интересующий вас чат:",
      {
        parse_mode: "HTML",
        reply_markup: technicalMenu,
      }
    );
  })
  .text("Обучение", async (ctx) => {
    await ctx.editMessageText(
      "<b>Обучение и развитие:</b>\n\nВыберите раздел:",
      {
        parse_mode: "HTML",
        reply_markup: educationMenu,
      }
    );
  })
  .row()
  .text("Чилл-чаты", async (ctx) => {
    await ctx.editMessageText(
      "<b>Чилл-зоны:</b>\n\nВыберите интересующий вас чат:",
      {
        parse_mode: "HTML",
        reply_markup: chillMenu,
      }
    );
  })
  .row()
  .text("Оставить отзыв", async (ctx) => {
    await ctx.conversation.enter("feedback");
  })
  .row();

// Регистрация всех меню
mainMenu.register(technicalMenu);
mainMenu.register(educationMenu);
mainMenu.register(chillMenu);

// Функция для начального отображения меню
export async function showMainMenu(ctx: MyContext) {
  await ctx.reply("Выберите категорию:", {
    reply_markup: mainMenu,
  });
}
