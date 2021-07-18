"use strict";
exports.__esModule = true;
exports.tmiOptions = void 0;
var dotenv = require("dotenv");
var client_1 = require(".prisma/client");
// import channels from "../private/tmi_channels.json";
var prisma = new client_1.PrismaClient();
var channels = [];
console.log("~ channels", channels);
prisma.user.findMany().then(function (data) {
    data.forEach(function (user) {
        channels.push(user.name);
    });
});
// const main = async () => {
//   const users = await prisma.user.findMany();
//   channels = users.map((user) => user.name);
// };
// main();
console.log(channels);
dotenv.config();
exports.tmiOptions = {
    options: {
        clientId: process.env.TWITCH_CLIENT_ID,
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: process.env.TWITCH_USERNAME,
        password: "oauth:" + process.env.TWITCH_OAUTH_PASSWORD
    },
    channels: channels
};
