mock-echo
=============

[![Travis][build-badge]][build] [![npm package][npm-badge]][npm]

[build-badge]: https://img.shields.io/travis/alexxiyang/mock-echo/master.svg?style=flat-square
[build]: https://travis-ci.org/alexxiyang/mock-echo

[npm-badge]: https://img.shields.io/npm/v/mock-echo.svg?style=flat-square
[npm]: https://www.npmjs.org/package/mock-echo

Mocking framework for [Laravel](https://laravel.com/) [Echo](https://laravel.com/docs/5.7/broadcasting#installing-laravel-echo)

# Installation

`npm i mock-echo`

# Usage

Import mock-echo 
`import MockEcho from 'mock-echo'`

Replace global object `Echo` with `new MockEcho()` before every unit test
```javascript
let mockEcho

beforeEach(() => {
    mockEcho = new MockEcho()
    global.Echo = mockEcho
})
```

Remember to delete global object `Echo` after every unit test
```javascript
afterEach(() => {
    delete global.Echo
})
```

## Determine whether channel has been listened

You can use `channelExist`, `privateChannelExist` or `presenceChannelExist` to determine whether channel has been listened:

* `channelExist`: channel
* `privateChannelExist`: private channel
* `presenceChannelExist`: presence channel

Example:
```javascript
expect(mockEcho.channelExist('news')).toBe(true)
expect(mockEcho.privateChannelExist('meeting')).toBe(true)
expect(mockEcho.presenceChannelExist('chat')).toBe(true)
```

> All examples are using `expect` as assertion library

## Get mock channel object

You can use `getChannel`, `getPrivateChannel`, `getPresenceChannel` to get mock channel object

* `getChannel`: channel
* `getPrivateChannel`: private channel
* `getPresenceChannel`: presence channel

Mock channel object has functions `eventExist`, `broadcast`, etc.

Example:
```javascript
expect(mockEcho.getChannel('news').eventExist('NewsMessage')).toBe(true)
```

## Determine whether event has been listened

You can use `getChannel(channelName).eventExist`, `getPrivateChannel(channelName).eventExist` or `getPresenceChannel(channelName).eventExist` to determine whether event has been listened:

* `getChannel(channelName).eventExist`: channel
* `getPrivateChannel(channelName).eventExist`: private channel
* `getPresenceChannel(channelName).eventExist`: presence channel

Example:
```javascript
expect(mockEcho.getChannel('news').eventExist('NewsMessage')).toBe(true)
expect(mockEcho.getPrivateChannel('meeting').eventExist('MeetingMessage')).toBe(true)
expect(mockEcho.getPresenceChannel('chat').eventExist('ChatMessage')).toBe(true)
```

## Broadcast event

You can use `broadcast` to broadcast an event.

> Note: If you are using `vue-test-utils`, call `$nextTick` before assertion.

Example:
```javascript
mockEcho.getChannel('news').broadcast('NewsMessage', { message: 'Hello World' })
wrapper.vm.$nextTick(() => {
    expect(wrapper.find('.message').text()).toBe('It said Hello World')
    done()
})
```

## Presence channel actions

You can use `iJoin`, `userJoin`, `userLeave` to trigger presence channel actions:

* `iJoin`: trigger `here` listener
* `userJoin`: trigger `joining` listner. It will return `subId` after calling `userJoin`. You can use this `subId` to get this user away from this channel.
* `userLeave`: trigger `leaving` listner. Use `subId` which got from `userJoin` to get this user away from this channel.

> Note: If you are using `vue-test-utils`, call `$nextTick` before assertion.

Example:
```javascript
mockEcho.getPresenceChannel('chat').iJoin({id: 1, name: 'Alex'})
wrapper.vm.$nextTick(() => {
    expect(wrapper.find('.here-message').text()).toBe('There are 1 users')
    done()
})

// You will need paulSubId to get this user away from this channel
let paulSubId = mockEcho.getPresenceChannel('chat').userJoin({id: 2, name: 'Paul'})
wrapper.vm.$nextTick(() => {
    expect(wrapper.find('.join-message').text()).toBe('Paul joined')
    done()
})

mockEcho.getPresenceChannel('chat').userLeave(paulSubId)
wrapper.vm.$nextTick(() => {
    expect(wrapper.find('.leave-message').text()).toBe('Paul leaved')
    done()
})
```

## Client events

You can use `userWhisper` to send user event. Only private channel object and presence channel object have `userWhisper`.

> Note: If you are using `vue-test-utils`, call `$nextTick` before assertion.

Example:
```javascript
// private channel
mockEcho.getPrivateChannel('meeting').userWhisper('meetingClicking', { username: username })
wrapper.vm.$nextTick(() => {
    expect(wrapper.find('.whisper-message').text()).toBe(`${username} is clicking the button`)
    done()
})

// presence channel
mockEcho.getPresenceChannel('chat').userWhisper('chatClicking', { username: username })
wrapper.vm.$nextTick(() => {
    expect(wrapper.find('.whisper-message').text()).toBe(`${username} is clicking the button`)
    done()
})
```

# If you found any bugs

Please create the issue

可以用中文