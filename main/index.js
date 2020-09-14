const request = require("request");
const music = require("./music.js");
const msub = require("./msub-api.js");
const discord = require("discord.js");
const client = new discord.Client();
const prefix = "m.";
const admin = []
let HourPerRam = [];
let HourPerRamData = [];
let messageReaction = {};

const TOKEN = "";

client.on('guildMemberAdd', member => {
    client.user.setActivity(`${prefix}help | ${client.users.cache.size}명과 함께 활동중`);
});

client.on('guildMemberRemove', member => {
    client.user.setActivity(`${prefix}help | ${client.users.cache.size}명과 함께 활동중`);
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    if (music.getServerConnect()[newMember.guild.id] != null && music.getServerConnect()[newMember.guild.id].voice != null) {
        if (music.getServerConnect()[newMember.guild.id].voice.members.size == 1) {
            music.getServerConnect()[newMember.guild.id] != null && music.getServerConnect()[newMember.guild.id].connect.dispatcher != null && music.getServerConnect()[newMember.guild.id].connect != null ? music.getServerConnect()[newMember.guild.id].connect.dispatcher.end() : null;
            music.getServerConnect()[newMember.guild.id].voice.leave();
            music.getServerConnect()[newMember.guild.id].lastroom != null ? music.getServerConnect()[newMember.guild.id].lastroom.send("아무도 방에 있지 않아 자동으로 중지합니다.") : null;
            music.reset(newMember.guild.id);
        }
    }
});

client.once("ready", () => {
    console.log("봇 켜짐!");
    client.user.setActivity(`${prefix}help | ${client.users.cache.size}명과 함께 활동중`);
});

process.on('uncaughtException', (err) => {
    console.log(err);
});

client.on("messageReactionAdd", (reaction, user) => {
    if (user.bot) return;
    try {
        messageReaction[reaction.message.id] != null ? messageReaction[reaction.message.id].onClick(reaction, user, messageReaction[reaction.message.id].message, messageReaction[reaction.message.id].customValue) : null;
    } catch (e) {
        console.log(e)
    }
});

client.on("messageReactionRemove", (reaction, user) => {
    if (user.bot) return;
    try {
        messageReaction[reaction.message.id] != null ? messageReaction[reaction.message.id].onClick(reaction, user, messageReaction[reaction.message.id].message, messageReaction[reaction.message.id].customValue) : null;
    } catch (e) {}
});

getRamUsage = function() {
    let os = require("os");
    return Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);
}

client.on("message", message => {
    if (HourPerRam.indexOf(new Date().getHours()) == -1) {
        HourPerRam.push(new Date().getHours());
        HourPerRamData.push(getRamUsage())
    }
    if (HourPerRam.length > 10) {
        HourPerRam.shift()
        HourPerRamData.shift();
    }

    sendRamUsageGraph = function() {
        let label = HourPerRam
        let url = `https://quickchart.io/chart?bkg=white&c={type:'line',data:{labels:["${String(label.join("시\",\"")+"시")}"],datasets:[{label:'램+사용량',data:[${String(HourPerRamData)}],fill:false,borderColor:'rgba(75,192,192,255)'}]}}`
        message.channel.send(new discord.MessageEmbed().setColor("2f3136").setImage(url))
    }


    getUser = function(tag) {
        let us = client.user
        if (tag == null) us = client.user
        if (typeof tag == "number")
            if (!isNaN(Number(tag))) us = client.users.cache.get(tag);
        if (typeof tag == "string") us = message.guild.members.cache.find(m => m.displayName == tag)
        if (typeof tag == "object") us = tag.author;
        return message.guild.member(us)
    }

    say = function(msg, tag) {
        message.member.voice.channel.join().then(connection => {
            let url
            if (tag == 1) url = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ko&q="
            if (tag == 0 || tag == null) url = "https://tts-translate.kakao.com/newtone?message="
            const dispatcher = connection.play(url + encodeURIComponent(msg))
        })
    }

    messageReaction.send = function(str, arr, onClick, customValue, messageStill) {
        try {
            let msg = (messageStill == null ? message : messageStill);
            if (!Array.isArray(arr)) return "It is not an array.";
            msg.channel.send(str).then((message) => {
                arr.forEach((val) => {
                    message.react(val).catch((e) => {});
                })
                messageReaction[message.id] == null ? messageReaction[message.id] = {} : null;
                messageReaction[message.id].message = message;
                messageReaction[message.id].onClick = (onClick != null ? onClick : () => {});
                customValue == null ? null : messageReaction[message.id].customValue = customValue;
            }).catch((e) => {});
        } catch (e) {}
    }
    messageReaction.AuthorSend = function(str, arr, onClick, customValue, messageStill) {
        try {
            let msg = (messageStill == null ? message : messageStill);
            if (!Array.isArray(arr)) return "It is not an array.";
            msg.author.send(str).then((message) => {
                arr.forEach((val) => {
                    message.react(val).catch((e) => {});
                })
                messageReaction[message.id] == null ? messageReaction[message.id] = {} : null;
                messageReaction[message.id].message = message;
                messageReaction[message.id].onClick = (onClick != null ? onClick : () => {});
                customValue == null ? null : messageReaction[message.id].customValue = customValue;
            }).catch((e) => {});
        } catch (e) {}
    }



    if (!message.guild) return;

    if (!message.content.trim().startsWith(prefix)) return;
    let msg = message.content.trim().slice(prefix.length);
    let room = message.channel.name;
    let sender = message.author.username;
    let userID = message.author.id
    let roomID = message.guild.id;
    let args = msg.split(" ");

    switch (args[0]) {

        case "p":
        case "재생":
        case "play":
            let ct = message
            if (args[1] == null) {
                message.channel.send(`알 수 없는 형식입니다 다음과 같이 보내주세요.\n\`${prefix}${args[0]} <url|검색할것>\``);
                return;
            }
            if (args[1].startsWith("http")) {
                if (args[1].includes("&list")) {
                    let index = 0;
                    if (args[1].includes("&index")) {
                        index = Number(args[1].split("&index=")[1]) - 1;
                    }
                    request.get(args[1], function(e, r, b) {
                        let jsons = [];
                        let json = JSON.parse(b.split("itialData\"] = ")[1].split(";\n    window[\"ytInitialPl")[0]);
                        for (let n = 0 + index; n < json.contents.twoColumnWatchNextResults.playlist.playlist.contents.length; n++) {
                            let video = json.contents.twoColumnWatchNextResults.playlist.playlist.contents[n].playlistPanelVideoRenderer;
                            let result = {};
                            result.title = video.title.simpleText;
                            result.author = video.shortBylineText.runs[0].text;
                            result.length = video.lengthText.simpleText;
                            result.image = video.thumbnail.thumbnails[0].url
                            result.url = "https://www.youtube.com/watch?v=" + video.videoId;
                            jsons.push(result)
                        }
                        music.addMusicList(message, jsons, discord)
                    })
                } else {
                    request(args[1], function(error, res, body) {
                        let json = JSON.parse(body.split("itialPlayerResponse\"] = ")[1].split(";\n    if (window.ytcsi)")[0]);
                        let result = {};
                        try {
                            result.title = json.videoDetails.title;
                            result.author = json.videoDetails.author;
                            let time = json.videoDetails.lengthSeconds;
                            result.length = (time == 0 ? "***LIVE***" : toTime(time));
                            result.url = "https://www.youtube.com/watch?v=" + json.videoDetails.videoId;
                            result.image = json.videoDetails.thumbnail.thumbnails[0].url;
                        } catch (e) {
                            result.title = "검색 결과가 없습니다.";
                        }
                        music.addMusic(message, result, discord);
                    })

                }
            } else {

                request.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(msg.replace(args[0], "").trim())}&sp=EgIQAQ%253D%253D`, (err, res, body) => {
                    serachListEmbed = function(json2) {
                        let json = youtubeSearch(body, json2.page + 1)
                        let embed = new discord.MessageEmbed()
                            .setColor("#86A8E7")
                            .setTitle(json.title)
                            .setAuthor(`${msg.replace(args[0],"").trim()} 검색 결과 ( ${json2.page+1} / 5 )`)
                            .setDescription(` ➯ 게시자 - **${json.author}**\n ➯ 길이 - **${json.length}**\n\n( 아래 버튼을 눌러 선택할 수 있습니다. )`)
                            .setThumbnail(json.image)
                            .setFooter(message.author.username, message.author.avatarURL());
                        return embed
                    }
                    let json = {}
                    json.user = userID
                    json.page = 0;
                    messageReaction.send(serachListEmbed(json), ["◀️", "▶️", "☑️", "❌"], function(reaction, user, msg, json) {
                        if (user.id != json.user) return;
                        switch (reaction.emoji.name) {
                            case "◀️":
                                if (json.page != 0) {
                                    json.page--;
                                    msg.edit(serachListEmbed(json));
                                } else {
                                    json.page = 4
                                    msg.edit(serachListEmbed(json));
                                }
                                break;
                            case "▶️":
                                if (json.page != 4) {
                                    json.page++;
                                    msg.edit(serachListEmbed(json));
                                } else {
                                    json.page = 0;
                                    msg.edit(serachListEmbed(json));
                                }
                                break
                            case "☑️":
                                msg.delete();
                                music.addMusic(message, youtubeSearch(body, json.page + 1), discord);
                                delete messageReaction[msg.id]
                                break;
                            case "❌":
                                msg.delete()
                                delete messageReaction[msg.id]
                                message.channel.send("취소되었습니다")
                                break
                        }

                    }, json, ct)
                });
            }
            break;

        case "ev":
            if (admin.indexOf(userID) != -1) {
                try {
                    let result = String(eval(msg.slice(3)));
                    message.channel.send(result == null || String(result).length == 0 ? "null" : result).catch(function(error) {
                        message.channel.send(error.message);
                    });
                } catch (e) {
                    message.channel.send(e.message);
                }
            }
            break;

        case "help":
        case "h":
        case "도움말":
            let a = message;

            let jsona = {}
            jsona.page = 0;
            jsona.user = userID;

            function helpEmbed(json) {
                let description = ""
                if (json.page == 0) {
                    description = ""
                    description += ` ➯ ${prefix}play <url|검색> - 곡을 재생합니다. ( ${prefix}p 또는 ${prefix}재생 )\n`;
                    description += ` ➯ ${prefix}stop - 곡 재생을 중지합니다. ( ${prefix}s 또는 ${prefix}중지 )\n`;
                    description += ` ➯ ${prefix}skip <수(없어도됌)> - 현재 틀고 있는 곡을 건너 뜁니다. ( ${prefix}sk 또는 ${prefix}넘기기 )\n`;
                    description += ` ➯ ${prefix}list - 재생 목록을 불러옵니다. ( ${prefix}l 또는 ${prefix}목록 )\n`;
                    description += ` ➯ ${prefix}pause - 현재 재생하는 곡을 잠시 정지시킵니다. ( ${prefix}pa 또는 ${prefix}일시정지 )\n`;
                } else if (json.page == 1) {
                    description = ""
                    description += ` ➯ ${prefix}resume - 정지시킨 곡을 다시 틉니다. ( ${prefix}re 또는 ${prefix}재개 )\n`;
                    description += ` ➯ ${prefix}np - 지금 재생하고 있는 곡의 정보를 불러옵니다. ( 또는 ${prefix}재생곡 )\n`;
                    description += ` ➯ ${prefix}repeat - 재생 목록에 있는 곡을 반복시킵니다. ( 또는 ${prefix}반복 )\n`;
                    description += ` ➯ ${prefix}help - 도움말을 보냅니다. ( ${prefix}h 또는 ${prefix}도움말 )\n`;
                    description += ` ➯ ${prefix}covid - 코로나 정보를 불러옵니다. ( 또는 ${prefix}코로나 )\n`;
                } else if (json.page == 2) {
                    description = ""
                    description += ` ➯ ${prefix}hangang - 한강 정보를 불러옵니다. ( 또는 ${prefix}한강 )\n`;
                    description += ` ➯ ${prefix}book <학교> <지역> <책제목> - 책 정보를 불러옵니다. ( 또는 ${prefix}책 )\n`;
                    description += ` ➯ ${prefix}music <곡제목> - 곡 정보를 불러옵니다. ( 또는 ${prefix}노래 )\n`;
                    description += ` ➯ ${prefix}typhoon - 태풍 정보를 불러옵니다. ( 또는 ${prefix}태풍 )\n`;
                }
                let embed = new discord.MessageEmbed()
                    .setColor("#86A8E7")
                    .setTitle(`밍규봇 도움말 ( ${json.page+1} / 3)`)
                    .setThumbnail("https://msub.kr/assets/img/%EB%AF%BC%EA%B7%9C%EB%A7%8C%EB%91%90_%EB%B0%B0%EA%B2%BD.png")
                    .setDescription(description)
                    .setFooter(sender, message.author.avatarURL());
                return embed
            }
            messageReaction.AuthorSend(helpEmbed(jsona), ["◀️", "▶️"], function(r, u, m, j) {
                if (u.id != j.user) return;
                switch (r.emoji.name) {
                    case "◀️":
                        if (j.page != 0) {
                            j.page--
                            m.edit(helpEmbed(j))
                        } else {
                            j.page = 2;
                            m.edit(helpEmbed(j))
                        }
                        break;
                    case "▶️":
                        if (j.page != 2) {
                            j.page++
                            m.edit(helpEmbed(j))
                        } else {
                            j.page = 0;
                            m.edit(helpEmbed(j))
                        }
                        break;
                }

            }, jsona, a)
            break;

        case "skip":
        case "sk":
        case "넘기기":
            music.skipMusic(message, (args[1] == null ? 1 : args[1]));
            break;

        case "stop":
        case "s":
        case "넘기기":
            music.stopMusic(message);
            break;

        case "repeat":
        case "반복":
            music.repeatMusic(message);
            break;

        case "np":
        case "재생곡":
            music.nowPlaying(message, discord);
            break;

        case "pause":
        case "pa":
        case "일시정지":
            music.pauseMusic(message);
            break;

        case "가위바위보":
        case "가바보":
            let cantstill = message;
            messageReaction.send(`<@${userID}> 안 내면 진거 가위바위보!`, ["✌️", "✊", "🖐"], function(reaction, user, message, userID) {
                if (user.id != userID) return;
                let bot = [1, 2, 3][Math.floor(Math.random() * 3)];
                let botEmoji = {
                    1: "✌️",
                    2: "✊",
                    3: "🖐"
                };
                if (botEmoji[bot] == reaction.emoji.name) {
                    message.edit(`<@${userID}> ${botEmoji[bot]}!`)
                    message.channel.send(`<@${userID}> 흠흠, 비겼네요.`);
                } else if (botEmoji[(bot + 1 == 4 ? 1 : bot + 1)] == reaction.emoji.name) {
                    message.edit(`<@${userID}> ${botEmoji[bot]}!`)
                    message.channel.send(`<@${userID}> 축하합니다, 이기셨어요.`);
                } else {
                    message.edit(`<@${userID}> ${botEmoji[bot]}!`)
                    message.channel.send(`<@${userID}> 저런, 아무래도 제가 이긴것 같네요.`);
                }
                delete messageReaction[message.id];
            }, userID, cantstill);
            break;


        case "resume":
        case "re":
        case "재개":
            music.resumeMusic(message);
            break;

        case "list":
        case "l":
        case "목록":
            let c = message
            let playList = music.getPlayList(message.guild.id);
            if (playList == null || playList[0] == null) {
                message.channel.send("예약한 곡이 없습니다.");
                return;
            }

            let json = {};
            json.user = userID;
            json.serverConnect = music.getServerConnect()[message.guild.id];
            json.playList = playList;
            json.page = 0;
            listEmbed = function(json) {
                let description = ""
                for (let n = 0 + ((json.page) * 5); n < (json.page + 1 != (Math.ceil((json.playList.length) / 5) < 1 ? 1 : Math.ceil((json.playList.length) / 5)) ? 5 + ((json.page) * 5) : json.playList.length); n++) {
                    description += `\`${n+1}\` ${n==0? (json.serverConnect.isPause? ":pause_button:  ":":musical_note:  "):""} **${json.playList[n].title}** ( ${json.playList[n].length} )\n`
                }
                description += `\n( 요청한 사람만 페이지 변경을 할 수 있습니다. )`;
                let embed = new discord.MessageEmbed()
                    .setColor("#86A8E7")
                    .setTitle(`총 ${json.playList.length}개의 곡 재생 목록 ( ${json.page+1} / ${Math.ceil((json.playList.length)/5)} ) ${json.serverConnect.repeat? ":repeat: ":""}`)
                    .setDescription(description)
                    .setFooter(message.author.username, message.author.avatarURL());
                return embed;
            }
            let emojis = [];
            if (json.playList.length > 5) emojis = ["◀️", "▶️"]
            messageReaction.send(listEmbed(json), emojis, function(reaction, user, message, json) {
                if (user.id != json.user) return;
                switch (reaction._emoji.name) {
                    case "▶️":
                        if (json.page + 1 != (Math.ceil((json.playList.length) / 5) < 1 ? 1 : Math.ceil((json.playList.length) / 5))) {
                            json.page++;
                            message.edit(listEmbed(json));
                        }
                        break;
                    case "◀️":
                        if (json.page != 0) {
                            json.page--;
                            message.edit(listEmbed(json));
                        }
                        break;
                }

            }, json, c);
            break;

        case "covid":
        case "코로나":
            msub.coronaAPI(message, discord);
            break;

        case "hangang":
        case "한강":
            msub.hangangAPI(message, discord);
            break;

        case "태풍":
        case "typhoon":
            msub.typhoonAPI(message, discord);
            break;

        case "노래":
        case "music":
            var ca = message;
            if (args[1] == null) {
                message.channel.send(`알 수 없는 형식입니다 다음과 같이 보내주세요.\n\`${prefix}${args[0]} <곡제목>\``);
                return;
            }

            request.get(`https://api.music.msub.kr/?song=${encodeURIComponent(msg.replace(args[0],"").trim())}`, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    let json2 = JSON.parse(body);
                    json2.page = 0;
                    json2.user = userID;
                    if (json2.song[0] != null) {
                        musicEmbed = function(json) {
                            let description = "";
                            description += `➯ 아티스트 : ${json.song[json.page].artist}\n`;
                            description += `➯ 앨범 : ${json.song[json.page].album}\n\n`;
                            description += `${json.song[json.page].lyrics.replace(/\\n/g,"\n").replace(/<br>/g,"\n")}`;
                            description += `\n\n( 요청한 사람만 페이지 변경을 할 수 있습니다. )`;
                            let embed = new discord.MessageEmbed()
                                .setTitle(`${json.song[json.page].name} 곡 정보 ( ${json.page+1} / ${json.lineup.length} )`)
                                .setColor("#86A8E7")
                                .setDescription(description)
                                .setThumbnail(json.song[json.page].albumimg)
                                .setFooter(message.author.username, message.author.avatarURL());
                            return embed;
                        }
                        messageReaction.send(musicEmbed(json2), ["◀️", "▶️"], function(reaction, user, message, musicInfo) {
                            if (user.id != musicInfo.user) return;
                            switch (reaction._emoji.name) {
                                case "▶️":
                                    if (musicInfo.page != musicInfo.lineup.length - 1) {
                                        musicInfo.page++;
                                        message.edit(musicEmbed(musicInfo));
                                    } else {
                                        musicInfo.page = 0;
                                        message.edit(musicEmbed(musicInfo));
                                    }
                                    break;
                                case "◀️":
                                    if (musicInfo.page != 0) {
                                        musicInfo.page--;
                                        message.edit(musicEmbed(musicInfo));
                                    } else {
                                        musicInfo.page = musicInfo.lineup.length - 1
                                        message.edit(musicEmbed(musicInfo));
                                    }
                                    break;
                            }
                            const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));

                        }, json2, ca);
                    } else {
                        message.channel.send("검색 결과가 없습니다.");
                    }
                } else {
                    message.channel.send("서버와 연결할 수 없습니다.");
                }
            });
            break;

        case "책":
        case "book":
            let ll = message
            if (args[1] == null) {
                message.channel.send(`알 수 없는 형식입니다 다음과 같이 보내주세요.\n\`${prefix}${args[0]} <학교> <지역> <책제목>\``);
                return;
            }

            request.get(`https://api.book.msub.kr/?book=${encodeURIComponent(msg.replace(args[0],"").replace(args[1],"").replace(args[2],"").trim())}&school=${encodeURIComponent(args[1])}&local=${encodeURIComponent(args[2])}`, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    let json2 = JSON.parse(body);
                    json2.page = 0;
                    json2.user = userID;
                    if (json2.status != "error") {
                        bookEmbed = function(json) {
                            let des = "";
                            des += `➯ 제목 : ${json.result[json.page].title.unescapeHtml()}\n`;
                            des += `➯ 작가 : ${json.result[json.page].writer.unescapeHtml()}\n`;
                            des += `➯ 출판사 : ${json.result[json.page].company}\n`;
                            des += `➯ ${json.result[json.page].canRental? "대출 가능":"대출 불가능"}\n`;
                            des += `\n( 요청한 사람만 페이지 변경을 할 수 있습니다. )`;
                            let embed = new discord.MessageEmbed()
                                .setTitle(`${json.schoolName} 도서 검색 ( ${json.page+1} / ${json.result.length})`)
                                .setColor("#86A8E7")
                                .setImage(json.result[json.page].url)
                                .setDescription(des)
                                .setFooter(message.author.username, message.author.avatarURL());
                            return embed;
                        }
                        messageReaction.send(bookEmbed(json2), ["◀️", "▶️"], function onAddClick(reaction, user, message, bookInfo) {
                            if (user.id != bookInfo.user) return;
                            switch (reaction._emoji.name) {
                                case "▶️":
                                    if (bookInfo.page != bookInfo.result.length - 1) {
                                        bookInfo.page++;
                                        message.edit(bookEmbed(bookInfo));
                                    } else {
                                        bookInfo.page = 0
                                        message.edit(bookEmbed(bookInfo));
                                    }
                                    break;
                                case "◀️":
                                    if (bookInfo.page != 0) {
                                        bookInfo.page--;
                                        message.edit(bookEmbed(bookInfo));
                                    } else {
                                        bookInfo.page = bookInfo.result.length - 1
                                        message.edit(bookEmbed(bookInfo));
                                    }
                                    break;
                            }

                        }, json2, ll);
                    } else {
                        message.channel.send(json2.result);
                    }
                } else {
                    message.channel.send("서버와 연결할 수 없습니다.");
                }
            });
            break;
    }

});


youtubeSearch = function(body, index) {
    let json = JSON.parse(body.split("itialData\"] = ")[1].split(";\n    window[\"ytInitialPl")[0]);
    let result = {};
    let video = json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents
    video = (video[0].videoRenderer != null ? video[index - 1] : video[index])
    try {
        result.title = video.videoRenderer.title.runs[0].text;
        result.author = video.videoRenderer.ownerText.runs[0].text;
        result.length = video.videoRenderer.lengthText == null ? "***LIVE***" : video.videoRenderer.lengthText.simpleText;
        result.url = "https://www.youtube.com/watch?v=" + video.videoRenderer.videoId;
        result.image = video.videoRenderer.thumbnail.thumbnails[0].url;
        return result;
    } catch (e) {
        result.title = "검색 결과가 없습니다.";
        return result;
    }
}

//original by sire
String.prototype.unescapeHtml = function() {
    if (this == null) {
        return '';
    }
    return this.replace(/&amp/g, '&').replace(/&lt/g, '<').replace(/&gt/g, '>').replace(/&quot/g, '"').replace(/&#039/g, "'").replace(/&#39/g, "'").trim();
}

toTime = function(sec) {
    let sec_num = Number(sec);
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor(sec_num / 60) % 60;
    let seconds = sec_num % 60;
    minutes = (minutes < 9 && (hours != 0 || minutes == 0) ? "0" + minutes : minutes);
    seconds = (seconds < 9 ? "0" + seconds : seconds);
    return [hours, minutes, seconds].filter(v => v != "0").join(":");
}

client.login(TOKEN);
