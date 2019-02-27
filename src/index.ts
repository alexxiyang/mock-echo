import * as _ from "lodash";

class Channel {
    events: object
    clientEvents: Array<string>
    constructor () {
        this.events = {}
    }
    listen (eventName: string, fn: any) {
        this.events[eventName] = fn;
        return this
    }
    broadcast (eventName, event) {
        if (typeof this.events[eventName] === 'undefined') {
            console.error(`Channel didn't listen to event: ${eventName}`);
            return
        }
        this.events[eventName](event);
    }
    eventExist (eventName) {
        return typeof this.events[eventName] !== 'undefined'
    }

    clientEventExist (eventName) {
        return typeof this.clientEvents[`client-${eventName}`] !== 'undefined'
    }
}

class PrivateChannel extends Channel {
    clientEvents: Array<string>
    notificationFn: any
    constructor () {
        super()
        this.clientEvents = []
        this.notificationFn = null
    }

    whisper (eventName, event) {
        if (typeof this.clientEvents[`client-${eventName}`] === 'undefined') {
            console.error(`Channel didn't listen to client event: ${eventName}`)
            return
        }
        this.clientEvents[`client-${eventName}`](event)
    }

    listenForWhisper (eventName, whisperFn) {
        this.clientEvents[`client-${eventName}`] = whisperFn
        return this
    }

    notification (notificationFn) {
        this.notificationFn = notificationFn
        return this
    }

    notify (notifiable) {
        this.notificationFn(notifiable)
    }
}

class PresenceChannel extends PrivateChannel {
    users: Array<any>
    hereFn: any
    joiningFn: any
    leavingFn: any

    constructor () {
        super()
        this.users = []
        this.hereFn = null
        this.joiningFn = null
        this.leavingFn = null
    }

    iJoin (user: any) {
        if (user == null) {
            console.error('user is null!')
            return
        }

        user.subId = Math.floor(Math.random() * 1000)
        this.users.push(user)

        let broadcastUsers = this.getBroadcastUsers()
        this.hereFn(broadcastUsers)
    }
    userJoin (user) {
        if (user == null) {
            console.error('user is null!')
            return
        }
        
        let subId = Math.floor(Math.random() * 1000)
        user.subId = subId
        this.users.push(user)

        let broadcastUser = this.getBroadcastUser(user)
        this.joiningFn(broadcastUser)

        return subId;
    }
    userLeave (subId) {
        if (subId == null) {
            console.error('subId is null!')
            return
        }

        let leavingUser = this.findUserBySubId(subId)
        if (leavingUser == null) {
            console.error(`Cannot find user by subId ${subId} !`)
            return
        }
        let broadcastUser = this.getBroadcastUser(leavingUser)
        this.leavingFn(broadcastUser)
    }
    findUserBySubId (subId) {
        let targetUser = null
        for(let i = this.users.length -1; i >= 0 ; i--){
            let user = this.users[i]
            if (user.subId === subId) {
                targetUser = user
                this.users.splice(i, 1)
            }
        }
        return targetUser
    }
    getBroadcastUser (user) {
        let broadcastUser = _.cloneDeep(user)
        delete broadcastUser['subId']
        return broadcastUser
    }
    getBroadcastUsers () {
        let broadcastUsers = []
        for (let i = 0; i < this.users.length; i++) {
            broadcastUsers.push(this.getBroadcastUser(this.users[i]))
        }
        return broadcastUsers
    }
    here (fn) {
        this.hereFn = fn
        return this
    }
    joining (fn) {
        this.joiningFn = fn
        return this
    }
    leaving (fn) {
        this.leavingFn = fn
        return this
    }

    notification (notificationFn) {
        console.error(`Presence channel doesn't support notification`)
        return this
    }
}

class MockEcho {
    channels: object
    constructor () {
        this.channels = {};
    }
    private(channelName) {
        return this.listenChannelByFullName(`private-${channelName}`);
    }
    channel(channelName) {
        return this.listenChannelByFullName(channelName);
    }
    join(channelName) {
        let presenceChannel = this.listenChannelByFullName(`presence-${channelName}`)
        return presenceChannel
    }

    listenChannelByFullName(fullName) {
        if (typeof this.channels[fullName] === 'undefined') {
            if (fullName.startsWith('presence-')) {
                this.channels[fullName] = new PresenceChannel()
            } else if (fullName.startsWith('private-')) {
                this.channels[fullName] = new PrivateChannel()
            } else {
                this.channels[fullName] = new Channel()
            }
        }
        return this.channels[fullName]
    }
    getPrivateChannel(channelName) {
        return this.getChannelByFullName(`private-${channelName}`);
    }
    getChannel(channelName) {
        return this.getChannelByFullName(channelName);
    }
    getPresenceChannel (channelName) {
        return this.getChannelByFullName(`presence-${channelName}`);
    }
    getChannelByFullName(fullName) {
        if (typeof this.channels[fullName] === 'undefined') {
            console.error(`Echo doesn't have channel: ${fullName}`);
            return
        }
        return this.channels[fullName];
    }
    channelExistByFullName (fullName) {
        return typeof this.channels[fullName] !== 'undefined';
    }
    privateChannelExist (channelName) {
        return this.channelExistByFullName(`private-${channelName}`)
    }
    channelExist (channelName) {
        return this.channelExistByFullName(channelName)
    }
    presenceChannelExist (channelName) {
        return this.channelExistByFullName(`presence-${channelName}`)
    }
}

export default MockEcho;
