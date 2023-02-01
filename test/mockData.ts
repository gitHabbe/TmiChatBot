import { ITwitterTweetResponse, IYoutubePagination } from "../src/interfaces/socialMedia";
import { ITwitchChannel } from "../src/interfaces/twitch";
import { JoinedUser } from "../src/interfaces/prisma";
import { MessageData } from "../src/models/tmi/MessageData";
import { ChatUserstate } from "tmi.js";

export const tweetMockData: ITwitterTweetResponse = {
    data: {
        created_at: "2022-07-20T09:41:01.000Z",
        text: "New Lazygit release in stores now! https://t.co/tfgU5rtT2R",
        public_metrics: {
            retweet_count: 0,
            reply_count: 0,
            like_count: 4,
            quote_count: 1
        },
        id: "1549690832563097602",
        author_id: "1028054194186477568"
    },
    includes: {
        users: [
            {
                verified: false,
                username: "DuffieldJesse",
                id: "1028054194186477568",
                name: "Jesse Duffield"
            }
        ]
    }
};

export const youtubeVideoMockData: IYoutubePagination = {
    kind: "youtube#videoListResponse",
    etag: "8nKd6_FX6Z7iJnq7vkHBMoyPYok",
    items: [
        {
            etag: "TNc6sv3BQ2DUQ2K1wvhmVbwrXv0",
            snippet: {
                publishedAt: "2021-04-16T15:34:19Z",
                channelId: "UChxTrW-gXU58SE86xlHlbaw",
                title: "John Walker | Broken",
                description: `***\n\"I'm just trying to be the best Captain America I can be\".\n\nThe Falcon and The Winter Soldier is amazing Marvel show.\nI couldn't even imagine to saw such complex character in the show.\nWyatt Russell is incredible as John Walker!\n\nMusic: \nAudiomachine - Nothing To Prove To You\nhttps://www.youtube.com/watch?v=r3Dl7FykiB8\n\n#JohnWalker #CaptainAmerica #TheFalconAndTheWinterSoldier\n\nTwitter: https://twitter.com/crusade588\nSupport: https://www.paypal.me/crusade588\nSoftware: Adobe Premiere Pro\n\nCopyright Disclaimer Under Section 107 of the Copyright Act 1976, allowance is made for \"fair use\" for purposes such as criticism, comment, news reporting, teaching, scholarship, and research. Fair use is a use permitted by copyright statute that might otherwise be infringing. Non-profit, educational or personal use tips the balance in favourite of fair use.`,
            },
            contentDetails: {
                duration: "PT3M19S",
            },
            statistics: {
                viewCount: "335588",
                likeCount: "9896",
                dislikeCount: "123",
                favoriteCount: "0",
                commentCount: "1281"
            }
        }
    ]
};

export const commandMockData = {
    id: 1,
    content: "This is the content",
    madeBy: "Made by",
    name: "This is name of command",
    createdAt: new Date(),
    userId: 2,
    updatedAt: new Date()
}

export const offlineTwitchChannelMock: ITwitchChannel[] = [ {
    id: "0",
    started_at: "",
    display_name: "Habbe",
    title: "Mock title",
    broadcaster_login: "habbe",
    game_id: "123",
    game_name: "Diddy Kong Racing",
    islive: true
} ];

let onlineDate = new Date()
onlineDate.setHours(onlineDate.getHours() - 2)
onlineDate.setMinutes(onlineDate.getMinutes() - 5)
onlineDate.setSeconds(onlineDate.getSeconds() - 34)

export const onlineTwitchChannelMock: ITwitchChannel[] = [ {
    id: "0",
    started_at: onlineDate.toISOString(),
    display_name: "Habbe",
    title: "Mock title",
    broadcaster_login: "habbe",
    game_id: "123",
    game_name: "Diddy Kong Racing",
    islive: true
} ];

export const messageDataMock = new MessageData("#habbe", {}, "This is a test message");

export const joinedUserMock: JoinedUser = {
    id: 1,
    name: "habbe",
    createdAt: new Date("28-10-2022"),
    updatedAt: new Date("29-10-2022"),
    components: [],
    commands: [],
    settings: [],
    timestamps: [],
    trusts: []
}
export const chatterMock: ChatUserstate = {
    'badges': { 'broadcaster': '1', 'warcraft': 'horde' },
    'color': '#FFFFFF',
    'display-name': 'Schmoopiie',
    'emotes': { '25': [ '0-4' ] },
    'mod': true,
    'room-id': '58355428',
    'subscriber': false,
    'turbo': true,
    'user-id': '58355428',
    'user-type': 'mod',
    'emotes-raw': '25:0-4',
    'badges-raw': 'broadcaster/1,warcraft/horde',
    'username': 'habbe',
    'message-type': 'chat'
};