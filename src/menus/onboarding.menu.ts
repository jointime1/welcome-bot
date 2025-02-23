import { Menu } from "@grammyjs/menu";
import type { MyContext } from "index";

export const onboardingMenu = new Menu<MyContext>("onboarding-menu")
  .text("Технические чаты", async (ctx) => {
    await showStep(ctx, 1);
  })
  .text("Обучение", async (ctx) => {
    await showStep(ctx, 2);
  })
  .row()
  .text("Чилл-чаты", async (ctx) => {
    await showStep(ctx, 3);
  })
  .row()
  .text("Оставить отзыв", async (ctx) => {
    await ctx.conversation.enter("feedback");
  })
  .row();

// Функция для отображения конкретного шага
async function showStep(ctx: MyContext, step: number) {
  const steps = {
    1: `<b>Технические направления:</b>

• IT-X: Новички в IT
• IT-X: Профильный чат
• JS банда | Golang | DevOps
• Технический книжный клуб`,

    2: `<b>Обучение и развитие:</b>

• Материалы для обучения
• Митапы и конференции
• Карьерный рост`,

    3: `<b>Чилл-зоны:</b>

• Спорт и здоровье
• Крипта и инвестиции
• Москва: Сходки
• Аниме | Еда | Игры`,
  };

  await ctx.editMessageText(steps[step as keyof typeof steps], {
    parse_mode: "HTML",
    reply_markup: onboardingMenu,
  });
}
