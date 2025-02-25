import { Menu } from "@grammyjs/menu";
import type { MyContext } from "index";
import { db } from "index";

export const adminMenu = new Menu<MyContext>("admin-menu")
  .text("Создать мероприятие (для админов)", async (ctx) => {
    const ADMIN_IDS: number[] = [931916742]; // This should match the admin IDs in index.ts
    if (!ADMIN_IDS.includes(ctx.from?.id || 0)) {
      await ctx.reply("Только администраторы могут создавать мероприятия");
      return;
    }
    await ctx.conversation.enter("createEvent");
  })
  .text("Статистика пользователей", async (ctx) => {
    const ADMIN_IDS: number[] = [931916742];
    if (!ADMIN_IDS.includes(ctx.from?.id || 0)) {
      await ctx.reply("Только администраторы могут просматривать статистику");
      return;
    }
    
    try {
      // Общее количество пользователей
      const totalUsers = await db
        .selectFrom('users')
        .select(({ fn }) => [fn.count('id').as('count')])
        .executeTakeFirst();
      
      // Новые пользователи за последние 24 часа
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const newUsers = await db
        .selectFrom('users')
        .select(({ fn }) => [fn.count('id').as('count')])
        .where('created_at', '>=', yesterday.toISOString())
        .executeTakeFirst();
      
      // Статистика по месяцам
      const monthlyStats = await db
        .selectFrom('users')
        .select([
          ({ fn, ref }) => fn.extract('month', ref('created_at')).as('month'),
          ({ fn, ref }) => fn.extract('year', ref('created_at')).as('year'),
          ({ fn }) => fn.count('id').as('count')
        ])
        .groupBy([
          ({ fn, ref }) => fn.extract('month', ref('created_at')),
          ({ fn, ref }) => fn.extract('year', ref('created_at'))
        ])
        .orderBy('year', 'asc')
        .orderBy('month', 'asc')
        .execute();
      
      // Форматирование статистики по месяцам
      const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ];
      
      const monthlyStatsFormatted = monthlyStats.map(stat => 
        `${monthNames[Number(stat.month) - 1]} ${stat.year}: ${stat.count} пользователей`
      ).join('\n');
      
      await ctx.reply(
        `📊 <b>Статистика пользователей</b>\n\n` +
        `👥 Всего пользователей: ${totalUsers?.count || 0}\n` +
        `🆕 Новых за 24 часа: ${newUsers?.count || 0}\n\n` +
        `📅 <b>Статистика по месяцам:</b>\n` +
        `${monthlyStatsFormatted || 'Нет данных'}`,
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      await ctx.reply("❌ Ошибка при получении статистики пользователей");
    }
  })
  .row()
  .text("Статистика мероприятий", async (ctx) => {
    const ADMIN_IDS: number[] = [931916742];
    if (!ADMIN_IDS.includes(ctx.from?.id || 0)) {
      await ctx.reply("Только администраторы могут просматривать статистику");
      return;
    }
    
    try {
      // Общее количество мероприятий
      const totalEvents = await db
        .selectFrom('event')
        .select(({ fn }) => [fn.count('id').as('count')])
        .executeTakeFirst();
      
      // Предстоящие мероприятия
      const now = new Date();
      const upcomingEvents = await db
        .selectFrom('event')
        .select(({ fn }) => [fn.count('id').as('count')])
        .where('date', '>=', now.toISOString())
        .executeTakeFirst();
      
      // Прошедшие мероприятия
      const pastEvents = await db
        .selectFrom('event')
        .select(({ fn }) => [fn.count('id').as('count')])
        .where('date', '<', now.toISOString())
        .executeTakeFirst();
      
      // Ближайшие мероприятия (для отображения в статистике)
      const nextEvents = await db
        .selectFrom('event')
        .selectAll()
        .where('date', '>=', now.toISOString())
        .orderBy('date', 'asc')
        .limit(3)
        .execute();
      
      const nextEventsFormatted = nextEvents.map(event => 
        `📅 ${event.name} - ${new Date(event.date).toLocaleDateString()}`
      ).join('\n');
      
      await ctx.reply(
        `📊 <b>Статистика мероприятий</b>\n\n` +
        `🎪 Всего мероприятий: ${totalEvents?.count || 0}\n` +
        `🔜 Предстоящих: ${upcomingEvents?.count || 0}\n` +
        `✅ Прошедших: ${pastEvents?.count || 0}\n\n` +
        `<b>Ближайшие мероприятия:</b>\n` +
        `${nextEventsFormatted || 'Нет запланированных мероприятий'}`,
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error("Error fetching event statistics:", error);
      await ctx.reply("❌ Ошибка при получении статистики мероприятий");
    }
  })
  .text("Статистика отзывов", async (ctx) => {
    const ADMIN_IDS: number[] = [931916742];
    if (!ADMIN_IDS.includes(ctx.from?.id || 0)) {
      await ctx.reply("Только администраторы могут просматривать статистику");
      return;
    }
    
    try {
      // Общее количество отзывов
      const totalFeedback = await db
        .selectFrom('feedback')
        .select(({ fn }) => [fn.count('id').as('count')])
        .executeTakeFirst();
      
      // Новые отзывы за последние 7 дней
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const newFeedback = await db
        .selectFrom('feedback')
        .select(({ fn }) => [fn.count('id').as('count')])
        .where('createdAt', '>=', lastWeek.toISOString())
        .executeTakeFirst();
      
      // Последние 3 отзыва
      const recentFeedback = await db
        .selectFrom('feedback')
        .selectAll()
        .orderBy('createdAt', 'desc')
        .limit(3)
        .execute();
      
      const recentFeedbackFormatted = recentFeedback.map(feedback => {
        const username = feedback.username || feedback.userId;
        const date = new Date(feedback.createdAt).toLocaleDateString();
        const message = feedback.message.length > 30 
          ? feedback.message.substring(0, 30) + '...' 
          : feedback.message;
          
        return `👤 ${username} (${date}): ${message}`;
      }).join('\n');
      
      await ctx.reply(
        `📊 <b>Статистика отзывов</b>\n\n` +
        `💬 Всего отзывов: ${totalFeedback?.count || 0}\n` +
        `🔄 Новых за неделю: ${newFeedback?.count || 0}\n\n` +
        `<b>Последние отзывы:</b>\n` +
        `${recentFeedbackFormatted || 'Нет отзывов'}`,
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error("Error fetching feedback statistics:", error);
      await ctx.reply("❌ Ошибка при получении статистики отзывов");
    }
  })
  .row()
  .text("Общая статистика бота", async (ctx) => {
    const ADMIN_IDS: number[] = [931916742];
    if (!ADMIN_IDS.includes(ctx.from?.id || 0)) {
      await ctx.reply("Только администраторы могут просматривать статистику");
      return;
    }
    
    try {
      // Получение всей статистики разом
      const totalUsers = await db
        .selectFrom('users')
        .select(({ fn }) => [fn.count('id').as('count')])
        .executeTakeFirst();
        
      const totalEvents = await db
        .selectFrom('event')
        .select(({ fn }) => [fn.count('id').as('count')])
        .executeTakeFirst();
        
      const totalFeedback = await db
        .selectFrom('feedback')
        .select(({ fn }) => [fn.count('id').as('count')])
        .executeTakeFirst();
      
      // Статистика по дням недели регистрации пользователей
      const weekdayStats = await db
        .selectFrom('users')
        .select([
          ({ fn, ref }) => fn.extract('isodow', ref('created_at')).as('weekday'),
          ({ fn }) => fn.count('id').as('count')
        ])
        .groupBy([({ fn, ref }) => fn.extract('isodow', ref('created_at'))])
        .orderBy('weekday', 'asc')
        .execute();
      
      const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const weekdayData = Array(7).fill(0);
      
      weekdayStats.forEach(stat => {
        // isodow начинается с 1 (понедельник) до 7 (воскресенье)
        const index = Number(stat.weekday) - 1;
        if (index >= 0 && index < 7) {
          weekdayData[index] = Number(stat.count);
        }
      });
      
      const weekdayChart = weekdays.map((day, index) => 
        `${day}: ${'▇'.repeat(Math.ceil(weekdayData[index] / Math.max(...weekdayData, 1) * 10))} (${weekdayData[index]})`
      ).join('\n');
      
      const botStartDate = new Date(2025, 1, 1); // Заменить на реальную дату запуска бота
      const now = new Date();
      const daysRunning = Math.floor((now.getTime() - botStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      await ctx.reply(
        `📊 <b>Общая статистика бота</b>\n\n` +
        `⏱️ Дней в работе: ${daysRunning}\n` +
        `👥 Всего пользователей: ${totalUsers?.count || 0}\n` +
        `🎪 Всего мероприятий: ${totalEvents?.count || 0}\n` +
        `💬 Всего отзывов: ${totalFeedback?.count || 0}\n\n` +
        `<b>Регистрации по дням недели:</b>\n` +
        `${weekdayChart || 'Нет данных'}`,
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error("Error fetching general statistics:", error);
      await ctx.reply("❌ Ошибка при получении общей статистики");
    }
  })
  .row();

// Функция для отображения админ-меню
export async function showAdminMenu(ctx: MyContext) {
  const ADMIN_IDS: number[] = [931916742];
  if (!ADMIN_IDS.includes(ctx.from?.id || 0)) {
    await ctx.reply("Доступно только для администраторов");
    return;
  }
  
  await ctx.reply("🔐 <b>Панель администратора</b>\n\nВыберите действие:", {
    parse_mode: "HTML",
    reply_markup: adminMenu
  });
}
