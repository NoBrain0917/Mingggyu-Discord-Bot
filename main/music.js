const ytdl = require("ytdl-core");
const playList = {};
const serverConnect = {};
let isRepeat = false;

process.on('uncaughtException', (err) => {});

module.exports.getServerConnect = function() {
    return serverConnect;
}

module.exports.getPlayList = function(id) {
    return playList[id];
}

module.exports.reset = function(id) {
    delete serverConnect[id];
    playList[id] = [];
}

module.exports.nowPlaying = function(message, discord) {
    if (!message.member.voice.channel) {
        message.channel.send("통화방에 들어가 있지 않습니다.");
        return;
    }
    if (playList[message.guild.id] == null || playList[message.guild.id][0] == null) {
        message.channel.send("재생하고 있는 곡이 없습니다.");
        return;
    }
    let embed = new discord.MessageEmbed()
        .setColor("#86A8E7")
        .setAuthor("현재 재생 중인 곡")
        .setTitle(playList[message.guild.id][0].title)
        .setDescription(` ➯ **${toTime(Math.floor(serverConnect[message.guild.id].connect.dispatcher.streamTime / 1000))} / ${playList[message.guild.id][0].length}**`)
        .setThumbnail(playList[message.guild.id][0].image)
        .setFooter(message.author.username, message.author.avatarURL());
    message.channel.send(embed);

}

module.exports.pauseMusic = function(message) {
    if (!message.member.voice.channel) {
        message.channel.send("통화방에 들어가 있지 않습니다.");
        return;
    }
    if (playList[message.guild.id] == null || playList[message.guild.id][0] == null) {
        message.channel.send("재생하고 있는 곡이 없습니다.");
        return;
    }
    if (serverConnect[message.guild.id].isPause) {
        message.channel.send("이미 일시정지를 한 상태입니다.");
        return;
    }
    if (serverConnect[message.guild.id] != null && serverConnect[message.guild.id].connect.dispatcher != null && serverConnect[message.guild.id].connect != null) {
        serverConnect[message.guild.id].connect.dispatcher.pause();
        serverConnect[message.guild.id].isPause = true;
    }
    message.channel.send(`현재 재생 중인 곡을 일시정지했습니다.\n**\`${playList[message.guild.id][0].title}\`**`)
}

module.exports.resumeMusic = function(message) {
    if (!message.member.voice.channel) {
        message.channel.send("통화방에 들어가 있지 않습니다.");
        return;
    }
    if (playList[message.guild.id] == null || playList[message.guild.id][0] == null) {
        message.channel.send("재생하고 있는 곡이 없습니다.");
        return;
    }
    if (serverConnect[message.guild.id].isPause == false) {
        message.channel.send("이미 재생되고 있는 곡입니다.");
        return;
    }
    if (serverConnect[message.guild.id] != null && serverConnect[message.guild.id].connect.dispatcher != null && serverConnect[message.guild.id].connect != null) {
        serverConnect[message.guild.id].connect.dispatcher.resume();
        serverConnect[message.guild.id].isPause = false;
    }

    message.channel.send(`일시정지한 곡을 다시 재생합니다.\n**\`${playList[message.guild.id][0].title}\`**`)
}

module.exports.addMusicList = function(message, jsons, discord) {
    if (!message.member.voice.channel) {
        message.channel.send("통화방에 들어가 있지 않습니다.");
        return;
    }
    let permissions = message.member.voice.channel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        message.channel.send('권한이 없습니다.');
        return;
    }
    if (jsons[0].url == null) {
        message.channel.send("곡을 재생할 수 없습니다.");
        return;
    }
    playList[message.guild.id] == null ? playList[message.guild.id] = [] : null;
    serverConnect[message.guild.id] == null ? serverConnect[message.guild.id] = {} : null;
    serverConnect[message.guild.id].lastroom = message.channel;
    serverConnect[message.guild.id].voice = message.member.voice.channel;
    serverConnect[message.guild.id].isPause = false;
    let isFirst = true;
    playList[message.guild.id].length == 0 ? message.channel.send(`${jsons.length}개의 곡이 추가되었습니다.\n지금 이 곡을 재생하겠습니다.`) : message.channel.send(`${jsons.length}개의 곡이 재생 목록에 추가되었습니다.`);
    playList[message.guild.id].length == 0 ? isFirst = true : isFirst = false;
    for (let json of jsons) {
        playList[message.guild.id].push(json);
    }
    let json = playList[message.guild.id][0]
    let embed = new discord.MessageEmbed()
        .setColor("#86A8E7")
        .setTitle(json.title)
        .setDescription(` ➯ 게시자 - **${json.author}**\n ➯ 길이 - **${json.length}**`)
        .setThumbnail(json.image)
        .setFooter(message.author.username, message.author.avatarURL());
    message.channel.send(embed);
    isFirst ? this.playMusic(message) : null;;

}

module.exports.addMusic = function(message, json, discord) {
    if (!message.member.voice.channel) {
        message.channel.send("통화방에 들어가 있지 않습니다.");
        return;
    }
    let permissions = message.member.voice.channel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        message.channel.send('권한이 없습니다.');
        return;
    }
    if (json.url == null) {
        message.channel.send("곡을 재생할 수 없습니다.");
        return;
    }
    playList[message.guild.id] == null ? playList[message.guild.id] = [] : null;
    serverConnect[message.guild.id] == null ? serverConnect[message.guild.id] = {} : null;
    serverConnect[message.guild.id].lastroom = message.channel;
    serverConnect[message.guild.id].voice = message.member.voice.channel;
    serverConnect[message.guild.id].isPause = false;
    playList[message.guild.id].push(json);
    playList[message.guild.id].length == 1 ? message.channel.send("지금 이 곡을 재생하겠습니다.") : message.channel.send("재생 목록에 추가했습니다.");
    let embed = new discord.MessageEmbed()
        .setColor("#86A8E7")
        .setTitle(json.title)
        .setDescription(` ➯ 게시자 - **${json.author}**\n ➯ 길이 - **${json.length}**`)
        .setThumbnail(json.image)
        .setFooter(message.author.username, message.author.avatarURL());
    message.channel.send(embed)
    playList[message.guild.id].length == 1 ? this.playMusic(message) : null;


}

module.exports.listMusic = function(message, discord) {
    if (playList[message.guild.id] == null || playList[message.guild.id][0] == null) {
        message.channel.send("예약한 곡이 없습니다.");
        return;
    }
    let description = ""
    for (let n = 0; n < playList[message.guild.id].length; n++) {
        if (n > 9) {
            description += "...";
            break;
        }
        description += `\`${n+1}\` **${playList[message.guild.id][n].title}** ( ${playList[message.guild.id][n].length} )\n`
    }
    let embed = new discord.MessageEmbed()
        .setColor("#86A8E7")
        .setTitle(`곡 재생 목록 ( ${playList[message.guild.id].length} )`)
        .setDescription(description)
        .setFooter(message.author.username, message.author.avatarURL());
    message.channel.send(embed);
}

module.exports.repeatMusic = function(message) {
    if (!message.member.voice.channel) {
        message.channel.send("통화방에 들어가 있지 않습니다.");
        return;
    }
    if (playList[message.guild.id] == null || playList[message.guild.id][0] == null) {
        message.channel.send("재생하고 있는 곡이 없습니다.");
        return;
    }
    if (serverConnect[message.guild.id].repeat) {
        message.channel.send("반복 재생을 중지합니다.");
        serverConnect[message.guild.id].repeat = false;
    } else {
        message.channel.send("재생 목록에 있는 곡을 반복시킵니다.");
        serverConnect[message.guild.id].repeat = true;
    }

}

module.exports.stopMusic = function(message) {
    if (!message.member.voice.channel) {
        message.channel.send("통화방에 들어가 있지 않습니다.");
        return;
    }
    serverConnect[message.guild.id] != null && serverConnect[message.guild.id].connect.dispatcher != null && serverConnect[message.guild.id].connect != null ? serverConnect[message.guild.id].connect.dispatcher.end() : null;
    playList[message.guild.id] = [];
    message.channel.send("모든 곡 재생을 중지합니다.");
    delete serverConnect[message.guild.id].lastroom;
    serverConnect[message.guild.id].repeat = false;
}

module.exports.skipMusic = function(message, skipcount) {
    if (!message.member.voice.channel) {
        message.channel.send("통화방에 들어가 있지 않습니다.");
        return;
    }
    if (playList[message.guild.id] == null || playList[message.guild.id][0] == null) {
        message.channel.send("건너 뛸 곡이 없습니다.");
        return;
    } else {
        if (isNaN(Number(skipcount))) {
            message.channel.send("숫자로만 입력해 주세요.");
            return;
        }
        if (skipcount == 0) {
            message.channel.send("0을 넣을순 없습니다.");
            return;
        }
        if (playList[message.guild.id].length < skipcount) {
            message.channel.send("재생 목록보다 요청한 수가 더 많습니다.");
            return;
        }
        message.channel.send(`곡을 건너 뜁니다.\n**\`${playList[message.guild.id][0].title}\`${skipcount==1? "":`외 ${skipcount-1}개`}**`);
        for (let n = 0; n < skipcount - 1; n++) {
            playList[message.guild.id].shift();
        }
        if (serverConnect[message.guild.id] != null && serverConnect[message.guild.id].connect.dispatcher != null && serverConnect[message.guild.id].connect != null) {
            serverConnect[message.guild.id].connect.dispatcher.end();
        } else {
            playList[message.guild.id].shift();
            if (playList[message.guild.id][0] != null) {
                this.playMusic(message);
            } else {
                playList[message.guild.id] = [];
                serverConnect[message.guild.id].voice.leave();
                delete serverConnect[message.guild.id];
            }
        }
    }
}

module.exports.playMusic = function(message) {
    if (!message.member.voice.channel) {
        message.channel.send("통화방에 들어가 있지 않습니다.");
        return;
    }
    if (playList[message.guild.id].length == 0) {
        message.channel.send("곡을 틀 수 없습니다.");
        return;
    }
    message.member.voice.channel.join().then(connection => {
            try {
                serverConnect[message.guild.id].connect = connection;


                let dispatcher = serverConnect[message.guild.id].connect.play(ytdl(playList[message.guild.id][0].url, {
                    filter: format => ['251'],
                    quality: 'highestaudio',
                    highWaterMark: 1 << 25
                }));



                dispatcher.on("finish", () => {
                    if (serverConnect[message.guild.id].repeat) {
                        playList[message.guild.id].push(playList[message.guild.id][0])
                        playList[message.guild.id].shift();
                    } else {
                        playList[message.guild.id].shift();
                    }
                    playList[message.guild.id][0] != null ? this.playMusic(message) : null;
                });
                dispatcher.on("error", error => {
                    console.log(error);
                });



            } catch (e) {
                message.channel.send("곡을 재생할 수 없습니다.");
                z
            }
        })
        .catch(console.log);
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
