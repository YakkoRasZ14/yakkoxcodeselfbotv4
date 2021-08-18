/* eslint-disable no-unused-vars */
const { create, Client } = require('@open-wa/wa-automate')
const { color, options } = require('./tools')
const { ind, eng } = require('./message/text/lang/')
const { loader } = require('./function')
const { version, bugs } = require('./package.json')
const msgHandler = require('./message/index.js')
const figlet = require('figlet')
const canvas = require('discord-canvas')
const { ownerBot } = require('./config.json')
const fs = require('fs-extra')
const { groupLimit, memberLimit } = require('./database/bot/setting.json')

const start = (yakeys = new Client()) => {
    console.log(color(figlet.textSync('yakeysBot', 'Larry 3D'), 'cyan'))
    console.log(color('=> Bot successfully loaded! Database:', 'yellow'), color(loader.getAllDirFiles('./database').length), color('Library:', 'yellow'), color(loader.getAllDirFiles('./lib').length), color('Function:', 'yellow'), color(loader.getAllDirFiles('./function').length))
    console.log(color('=> Source code version:', 'yellow'), color(version))
    console.log(color('=> Bug? Error? Suggestion? Visit here:', 'yellow'), color(bugs.url))
    console.log(color('[yakeys]'), color('yakeysBot is now online!', 'yellow'))
    console.log(color('[DEV]', 'cyan'), color('Welcome back, Owner! Hope you are doing well~', 'magenta'))

    // Uncomment code di bawah untuk mengaktifkan auto-update file changes. Tidak disarankan untuk long-time use.
    // Uncomment code below to activate auto-update file changes. Not recommended for long-time use.
    // loader.nocache('../message/index.js', (m) => console.log(color('[WATCH]', 'orange'), color(`=> '${m}'`, 'yellow'), 'file is updated!'))

    yakeys.onStateChanged((state) => {
        console.log(color('[yakeys]'), state)
        if (state === 'UNPAIRED' || state === 'CONFLICT' || state === 'UNLAUNCHED') yakeys.forceRefocus()
    })

    yakeys.onAddedToGroup(async (chat) => {
        const gc = await yakeys.getAllGroups()
        console.log(color('[yakeys]'), 'Added to a new group. Name:', color(chat.contact.name, 'yellow'), 'Total members:', color(chat.groupMetadata.participants.length, 'yellow'))
        if (chat.groupMetadata.participants.includes(ownerBot)) {
            await yakeys.sendText(chat.id, ind.addedGroup(chat))
        } else if (gc.length > groupLimit) {
            await yakeys.sendText(chat.id, `Max groups reached!\n\nCurrent status: ${gc.length}/${groupLimit}`)
            await yakeys.deleteChat(chat.id)
            await yakeys.leaveGroup(chat.id)
        } else if (chat.groupMetadata.participants.length < memberLimit) {
            await yakeys.sendText(chat.id, `Need at least ${memberLimit} members in group!`)
            await yakeys.deleteChat(chat.id)
            await yakeys.leaveGroup(chat.id)
        } else {
            await yakeys.sendText(chat.id, ind.addedGroup(chat))
        }
    })

    yakeys.onMessage((message) => {
        // Uncomment code di bawah untuk mengaktifkan auto-delete cache pesan.
        // Uncomment code below to activate auto-delete message cache.
        /*
        yakeys.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 1000) {
                    console.log(color('[yakeys]'), color(`Loaded message reach ${msg}, cuting message cache...`, 'yellow'))
                    yakeys.cutMsgCache()
                    console.log(color('[yakeys]'), color('Cache deleted!', 'yellow'))
                }
            })
        */
        
        // Comment code msgHandler di bawah untuk mengaktifkan auto-update. Kemudian, uncomment code require di bawah msgHandler.
        // Comment code below to activate auto-update. Then, uncomment require code below msgHandler.
        msgHandler(yakeys, message)
        // require('./message/index.js')(yakeys, message)
    })

    yakeys.onIncomingCall(async (callData) => {
        await yakeys.sendText(callData.peerJid, ind.blocked(ownerBot))
        await yakeys.contactBlock(callData.peerJid)
        console.log(color('[BLOCK]', 'red'), color(`${callData.peerJid} has been blocked.`, 'yellow'))
    })

    yakeys.onGlobalParticipantsChanged(async (event) => {
        const _welcome = JSON.parse(fs.readFileSync('./database/group/welcome.json'))
        const isWelcome = _welcome.includes(event.chat)
        const gcChat = await yakeys.getChatById(event.chat)
        const pcChat = await yakeys.getContact(event.who)
        let { pushname, verifiedName, formattedName } = pcChat
        pushname = pushname || verifiedName || formattedName
        const { name, groupMetadata } = gcChat
        const botNumbers = await yakeys.getHostNumber() + '@c.us'
        try {
            if (event.action === 'add' && event.who !== botNumbers && isWelcome) {
                const pic = await yakeys.getProfilePicFromServer(event.who)
                if (pic === undefined) {
                    var picx = 'https://i.ibb.co/Tq7d7TZ/age-hananta-495-photo.png'
                } else {
                    picx = pic
                }
                const welcomer = await new canvas.Welcome()
                    .setUsername(pushname)
                    .setDiscriminator(event.who.substring(6, 10))
                    .setMemberCount(groupMetadata.participants.length)
                    .setGuildName(name)
                    .setAvatar(picx)
                    .setColor('border', '#00100C')
                    .setColor('username-box', '#00100C')
                    .setColor('discriminator-box', '#00100C')
                    .setColor('message-box', '#00100C')
                    .setColor('title', '#00FFFF')
                    .setBackground('https://www.photohdx.com/images/2016/05/red-blurry-background.jpg')
                    .toAttachment()
                const base64 = `data:image/png;base64,${welcomer.toBuffer().toString('base64')}`
                await yakeys.sendFile(event.chat, base64, 'welcome.png', `Welcome ${pushname}!`)
            } else if (event.action === 'remove' && event.who !== botNumbers && isWelcome) {
                const pic = await yakeys.getProfilePicFromServer(event.who)
                if (pic === undefined) {
                    var picxs = 'https://i.ibb.co/Tq7d7TZ/age-hananta-495-photo.png'
                } else {
                    picxs = pic
                }
                const bye = await new canvas.Goodbye()
                    .setUsername(pushname)
                    .setDiscriminator(event.who.substring(6, 10))
                    .setMemberCount(groupMetadata.participants.length)
                    .setGuildName(name)
                    .setAvatar(picxs)
                    .setColor('border', '#00100C')
                    .setColor('username-box', '#00100C')
                    .setColor('discriminator-box', '#00100C')
                    .setColor('message-box', '#00100C')
                    .setColor('title', '#00FFFF')
                    .setBackground('https://www.photohdx.com/images/2016/05/red-blurry-background.jpg')
                    .toAttachment()
                const base64 = `data:image/png;base64,${bye.toBuffer().toString('base64')}`
                await yakeys.sendFile(event.chat, base64, 'welcome.png', `Bye ${pushname}, we will miss you~`)
            }
        } catch (err) {
            console.error(err)
        }
    })
}

create(options(start))
    .then((yakeys) => start(yakeys))
    .catch((err) => console.error(err))
