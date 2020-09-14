const request = require("request");

module.exports.coronaAPI = function(message, discord) {
    request.get("https://capi.msub.kr/", (err, res, body) => {
        if (!err && res.statusCode == 200) {
            let json = JSON.parse(body);
            let description = "";
            description += `➯ 확진자 : ${json.today.confirmation}\n`;
            description += `➯ 완치자 : ${json.today.cured}\n`;
            description += `➯ 치료중 : ${json.today.isolation}\n`;
            description += `➯ 사망자 : ${json.today.dead}\n`;
            description += `➯ 검사중 : ${json.today.suspicion}\n`;
            let embed = new discord.MessageEmbed()
                .setTitle("코로나 19")
                .setColor("#86A8E7")
                .setDescription(description)
                .setURL("https://covid.msub.kr/")
                .setFooter(message.author.username, message.author.avatarURL());
            message.channel.send(embed)
        } else {
            message.channel.send("서버와 연결할 수 없습니다.");
        }
    });
}

module.exports.hangangAPI = function(message, discord) {
    request.get("https://api.hangang.msub.kr/", (err, res, body) => {
        if (!err && res.statusCode == 200) {
            let json = JSON.parse(body);
            let embed = new discord.MessageEmbed()
                .setColor("#86A8E7")
                .setTitle(`${json.temp}°C - ${json.station}`)
                .setFooter(message.author.username, message.author.avatarURL());
            message.channel.send(embed);
        } else {
            message.channel.send("서버와 연결할 수 없습니다.");
        }
    });
}

module.exports.typhoonAPI = function(message, discord) {
    request.get("https://api.typhoon.msub.kr/", (err, res, body) => {
        if (!err && res.statusCode == 200) {
            let json = JSON.parse(body);
            if (json["하이선"] != null) {
                let embed = new discord.MessageEmbed()
                    .setTitle(`${json["하이선"].othername} 정보`)
                    .setColor("#86A8E7")
                    .setDescription(json["하이선"].info[0].rem.replace(/\|/g, "\n").replace(/,/g, "\n"))
                    .setImage(json["하이선"].info[0].img)
                    .setFooter(message.author.username, message.author.avatarURL());
                message.channel.send(embed);
            } else {
                message.channel.send("서버와 연결할 수 없습니다.");
            }
        } else {
            message.channel.send("서버와 연결할 수 없습니다.");
        }
    });
}
