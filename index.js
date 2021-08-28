const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')

const token = '1967797300:AAHt94MCeLFchX_4HHBpybRISWNr56HPeEk'

const bot = new TelegramApi(token, {polling: true})
const chats ={};



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен угадать её )')
    const randNum = Math.floor(Math.random() * 10);
    chats[chatId] = randNum;
    console.log(chats);
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}
const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/cat', description: 'Присылает котиков'},
        {command: '/link', description: 'Ссылка на бота'},
        {command: '/game', description: 'Игра "Угадай цифру"'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === '/start'){
            await bot.sendMessage(chatId, `Привет, ${msg.chat.first_name} !!!`);
            return bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/73a/aed/73aaedd6-70a6-40f1-ae0d-1c0ed846a5b3/3.webp');
        }
        if (text === '/cat'){
            return bot.sendMessage(chatId, 'Любишь котиков ? Я тоже, смотри какие милые )))');
        }
        if (text === '/link'){
            const botLink = 't.me/Just_Lazy_bot'
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/9df/619/9df6199a-ff6a-338d-9f74-625b0a647045/21.webp');
            return bot.sendMessage(chatId, `Вот лови ссылочку на меня ${botLink}`);
        }
        if (text === '/game') {
            return startGame(chatId);
        }

        return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй ещё раз');

    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === 'again'){
            return startGame(chatId);
        }
        if (data === chats[chatId]){
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/9df/619/9df6199a-ff6a-338d-9f74-625b0a647045/1.webp');
            return bot.sendMessage(chatId, `Поздравляю ты угадал, я загадывал цифру ${chats[chatId]}`, againOptions);
        }else {
            await bot.sendMessage(chatId, `К сожалению ты не угадал, я загадывал цифру ${chats[chatId]}`, againOptions);
        }
    })
}

start()

