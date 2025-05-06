const { Telegraf, Markup, Input } = require('telegraf');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
require('dotenv').config();
// Подключение к MongoDB
mongoose.connect('mongodb://root:kkkb4b49badub10ubdu43b39abdajkq39u29b99fubfu9buauag3g9w4gfa@176.124.208.198:9999/telestatistics', {
    authSource: "admin"
});

// Определение схемы для групп
const groupSchema = new mongoose.Schema({
    groupId: String,
    title: String,
    ownerId: String,
    members: [
        {
            userId: String,
            username: String,
            action: String, // "joined" или "left"
            time: Date,
        },
    ],
});

const Group = mongoose.model('Group', groupSchema);
console.log(process.env.BOT_TOKEN)

const bot = new Telegraf(process.env.BOT_TOKEN);

// Добавление бота в группу
bot.on('my_chat_member', async (ctx) => {
    const update = ctx.update.my_chat_member;

    const chat = update.chat;
    const ownerId = update.from.id;
    const newStatus = update.new_chat_member.status;
    const oldStatus = update.old_chat_member.status;
//new4
    if (newStatus === 'administrator' && oldStatus !== 'administrator') {
        const existingGroup = await Group.findOne({ groupId: chat.id });

        if (!existingGroup) {
            await Group.create({
                groupId: chat.id,
                title: chat.title,
                ownerId: ownerId,
                members: [],
            });
            bot.telegram.sendMessage(process.env.ADMIN_ID,`Группа ${chat.title} добавлена! Пропишите /groups, чтобы просматривать её статистику и экспортировать данные в таблицу`)
        } else {
            
        }
    }
    else if (newStatus === 'left') {
        // Бот удален из групп4
        let group = await Group.findOne({ groupId: chat.id });
        const deletedGroup = await Group.findOneAndDelete({ groupId: chat.id });

        if (deletedGroup) {
            bot.telegram.sendMessage(process.env.ADMIN_ID, `Группа ${group.title} удалена из базы`)
        }
    }
});

bot.on('left_chat_member',async (ctx)=>{
    try {
        if(ctx.update.message.left_chat_member.username != "DG97g39akj_bot" && ctx.update.message.left_chat_member.username != "telestatisticsbot"){
            await ctx.deleteMessage();
        }
        
        console.log('Сообщение о новом участнике удалено.');
    } catch (err) {
        console.error('Не удалось удалить сообщение:', err);
    }
    
})
bot.on('new_chat_members', async (ctx) => {
    try {
        // Удаляем системное сообщение
        
        
        if(ctx.update.message.new_chat_member.username != "DG97g39akj_bot" && ctx.update.message.new_chat_member.username != "telestatisticsbot"){
            await ctx.deleteMessage();
        }
        
        console.log('Сообщение о новом участнике удалено.');
    } catch (err) {
        console.error('Не удалось удалить сообщение:', err);
    }
});
bot.on('chat_member', async (ctx) => {
    const update = ctx.update.chat_member;
    const chat = update.chat;
    const member = update.new_chat_member.user;
    const actionTime = new Date();

    // Проверяем, существует ли группа в базе данных
    const group = await Group.findOne({ groupId: chat.id });

    if (group) {
        const action =
            update.new_chat_member.status === 'member'
                ? 'joined'
                : update.new_chat_member.status === 'left'
                ? 'left'
                : null;

        if (action) {
            // Добавляем действие участника в базу
            group.members.push({
                userId: member.id,
                username: member.username || 'unknown',
                action,
                time: actionTime,
            });
            await group.save();
        }
    }
});

// Команда /groups
bot.command('groups', async (ctx) => {
    const userId = ctx.from.id;
    const groups = await Group.find();

    if (!groups || groups.length === 0) {
        return ctx.reply('Вы пока не добавили бота ни в одну группу.');
    }

    const buttons = groups.map((group) =>
        Markup.button.callback(group.title, `group_${group.groupId}`)
    );

    ctx.reply('Группы:', Markup.inlineKeyboard(buttons, { columns: 1 }));
});

// Статистика по группе
bot.action(/group_(.+)/, async (ctx) => {
    const groupId = ctx.match[1];
    const group = await Group.findOne({ groupId });

    if (!group) return ctx.reply('Группа не найдена.');

    const joinedCount = group.members.filter((m) => m.action === 'joined').length;
    const leftCount = group.members.filter((m) => m.action === 'left').length;

    const buttons = [
        Markup.button.callback('Экспорт в Excel', `export_${groupId}`),
    ];

    ctx.reply(
        `Группа: ${group.title}\nПришло пользователей: ${joinedCount}\nУшло пользователей: ${leftCount}`,
        Markup.inlineKeyboard(buttons)
    );
});
bot.command("start", async (ctx) => {

    ctx.replyWithPhoto({ source: './banner.png' },{
        caption : `Этот бот создан для сбора статистика <b>входов/выходов</b> участников групп.\nДобавьте этого бота к себе в беседу и выдайте ему права администратора\nДалее /groups сможет вам показать список ваших групп.\n\nДля добавления отслежки\n1. Откройте группу\n2. Добавьте в участники @telestatisticsbot\n3. После выдайте боту права администратора`,
        parse_mode: "HTML"
    })
});

// Экспорт в Excel
bot.action(/export_(.+)/, async (ctx) => {
    const groupId = ctx.match[1];
    const group = await Group.findOne({ groupId });

    if (!group) return ctx.reply('Группа не найдена.');

    // Формирование данных для Excel
    const data = group.members.map((m, index) => ({
        ID: index + 1,
        UserID: m.userId,
        Username: m.username,
        Action: m.action,
        Time: m.time.toISOString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Group Stats');

    const filePath = `/tmp/${group.title.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, filePath);

    ctx.replyWithDocument({ source: filePath, filename: `${group.title}.xlsx` });
});

// Запуск бота
bot.launch({
    allowedUpdates: [
        'message',
        'edited_message',
        'callback_query',
        'chat_member',
        'my_chat_member',
    ],
}).then(() => {
    console.log('Бот запущен');
});
