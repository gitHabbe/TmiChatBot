import { ITwitchChannel } from "../../src/interfaces/twitch"

const onlineDate = new Date()
onlineDate.setHours(onlineDate.getHours() - 2)
onlineDate.setMinutes(onlineDate.getMinutes() - 5)
onlineDate.setSeconds(onlineDate.getSeconds() - 34)

export const onlineTwitchChannelMock: ITwitchChannel = {
    id: "0",
    started_at: onlineDate.toISOString(),
    display_name: "Habbe",
    title: "Mock title",
    broadcaster_login: "habbe",
    game_id: "123",
    game_name: "Diddy Kong Racing",
    islive: true
}
export const onlineTwitchChannelsMock: ITwitchChannel[] = [ {
    id: "0",
    started_at: onlineDate.toISOString(),
    display_name: "Habbe",
    title: "Mock title",
    broadcaster_login: "habbe",
    game_id: "123",
    game_name: "Diddy Kong Racing",
    islive: true
} ]
export const offlineTwitchChannelMock: ITwitchChannel = {
    id: "0",
    started_at: "",
    display_name: "Habbe",
    title: "Mock title",
    broadcaster_login: "habbe",
    game_id: "123",
    game_name: "Diddy Kong Racing",
    islive: true
}