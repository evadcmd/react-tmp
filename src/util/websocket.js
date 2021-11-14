import webstomp from 'webstomp-client'

const ENTRY = 'ws/'
const HEADERS = {}

class WebSocket {
    constructor(entry=ENTRY, headers) {
        this.entry = entry 
        this.headers = headers || HEADERS
        this.subscriptions = {}
    }

    connect() {
        const self = this
        return new Promise(
            (resolve, reject) => {
                self.stomp = webstomp.over(new SockJS(ENTRY))
                self.stomp.connect(HEADERS, resolve, reject)
            }
        )
    }

    async subscribe(topic, onmessage) {
        /* const frame = */ await this.connect()
        this.subscriptions[topic] = await this.stomp.subscribe(topic, onmessage)
    }

    async send(topic, msg) {
        await this.stomp.send(topic, {}, JSON.stringify(msg))
    }

    unsubscribe(topic) {
        const subscription = this.subscriptions[topic]
        subscription.unsubscribe()
        delete this.subscriptions[topic]
    }

    disconnect() {
        this.stomp.disconnect()
    }
}

const websocket = new WebSocket()

export default websocket