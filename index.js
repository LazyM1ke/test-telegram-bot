const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions, weatherOptions} = require('./options')
const token = '1967797300:AAHt94MCeLFchX_4HHBpybRISWNr56HPeEk'
const weatherApiKey = 'b5bce7a9107606889053a45d9d671b3e'
const bot = new TelegramApi(token, {polling: true})
const chats ={};
const axios = require('axios')
const yandexApiKey = 'AQVN0y0O2Nu6jb6IPZVP59tXzLBQAxa18XLp25P7'


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
        {command: '/info', description: '/info {ваш никнейм на CodeWars}'},
        {command: '/link', description: 'Ссылка на бота'},
        {command: '/game', description: 'Игра "Угадай цифру"'},
        {command: '/weather', description: 'Прогноз погоды'}
    ])


    bot.on('message', async msg => {

        try {
            const text = msg.text;
            const chatId = msg.chat.id;
            const arrText = text.split(' ');

            if (text === '/start') {
                await bot.sendMessage(chatId, `Привет, ${msg.chat.first_name} !!!`);
                return bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/9df/619/9df6199a-ff6a-338d-9f74-625b0a647045/19.webp');
            }
            if (arrText[0] === '/info') {
                const axiosConf = {
                    method: 'GET',
                    url: 'https://www.codewars.com/api/v1/users/' + arrText[1],
                }
                axios(axiosConf).then((response) => {
                    return bot.sendMessage(chatId, `Твой никнейм - ${response.data.username}\nТвоя честь - ${response.data.honor}\n Позиция в таблице лидеров - ${response.data.leaderboardPosition}\n Всего завершено заданий - ${response.data.codeChallenges.totalCompleted}\n`);
                })
            }
            if (text === '/link') {
                const botLink = 't.me/Just_Lazy_bot'
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/9df/619/9df6199a-ff6a-338d-9f74-625b0a647045/21.webp');
                return bot.sendMessage(chatId, `Вот лови ссылочку на меня ${botLink}`);
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            if (arrText[0] === '/weather') {
                const axiosConf = {
                        method: 'GET',
                        url: `https://api.openweathermap.org/data/2.5/weather?q=${arrText[1]}&lang=ru&units=metric&APPID=${weatherApiKey}`,
                    }

                    axios(axiosConf).then((response) => {
                        return bot.sendMessage(chatId, `${response.data.name}\n 
Cейчас ${response.data.weather[0].description} ${response.data.main.temp}°С\n
Влажность: ${response.data.main.humidity}%\n 
Атмосферное давление: ${response.data.main.pressure} гПа\n 
Скорость ветра: ${response.data.wind.speed} м/c\n`)
                    })
                }

        }
        catch (e) {
            console.log("Какая-то ошибочка вышла: ", e.message);
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === 'again'){
            return startGame(chatId);
        }
        if (data == chats[chatId]){
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/9df/619/9df6199a-ff6a-338d-9f74-625b0a647045/1.webp');
            return bot.sendMessage(chatId, `Поздравляю ты угадал, я загадывал цифру ${chats[chatId]}`, againOptions);
        }else {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/9df/619/9df6199a-ff6a-338d-9f74-625b0a647045/7.webp');
            await bot.sendMessage(chatId, `К сожалению ты не угадал, я загадывал цифру ${chats[chatId]}`, againOptions);
        }
    })

    bot.on('voice', async msg => {
        const chatId = msg.chat.id;
        const stream = bot.getFileStream(msg.voice.file_id);

        let chunks = [];
        stream.on('data', chunk => chunks.push(chunk))
        stream.on('end', () => {
            const axiosConfig = {
                method: 'POST',
                url: 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize',
                headers: {
                    Authorization: 'Api-Key ' + yandexApiKey
                },
                data: Buffer.concat(chunks),
            }

            axios(axiosConfig).then(response => {
                const text = response.data.result;
                if (text === 'Как погода') {
                    const axiosConf = {
                        method: 'GET',
                        url: `https://api.openweathermap.org/data/2.5/weather?q=Kaliningrad&lang=ru&units=metric&APPID=${weatherApiKey}`,
                    }

                    axios(axiosConf).then((response) => {
                        return bot.sendMessage(chatId, `${response.data.name}\n 
Cейчас ${response.data.weather[0].description} ${response.data.main.temp}°С\n
Влажность: ${response.data.main.humidity}%\n 
Атмосферное давление: ${response.data.main.pressure} гПа\n 
Скорость ветра: ${response.data.wind.speed} м/c\n`)
                    })

                }
                bot.sendMessage(chatId, `Чтобы посмотреть погоду в других городах, используйте /weather {Название города на английском}`)

            })
        })
    })

}

start()

