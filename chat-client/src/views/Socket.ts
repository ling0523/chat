import { Toast } from 'mvi-web-plus'

export type SocketDataType = {
	//命令
	cmd: string
	//数据
	data?: {
		[key: string]: any
	}
}

class Socket {
	//socket对象
	private websocket: WebSocket | null = null
	//是否正在连接
	private isConnecting: boolean = false
	//socket地址
	private url: string
	constructor(url: string) {
		this.url = url
		//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
		window.onbeforeunload = () => {
			this.closeSocket()
		}
	}

	//心跳检测
	private heartbeat() {
		setTimeout(() => {
			this.send({
				cmd: 'heartbeat'
			})
			this.heartbeat()
		}, 30000)
	}

	//建立socket连接
	initSocket(onSuccess: () => void, onMessage: (data: SocketDataType) => void) {
		if (!this.isConnecting) {
			Toast.showToast({
				type: 'loading',
				message: '正在连接...'
			})
			this.isConnecting = true
		}
		this.websocket = new WebSocket(this.url)
		//连接发生错误的回调方法
		this.websocket.onerror = () => {
			console.log('%c WebSocket连接错误，尝试重新连接...', 'color:#f30')
			this.initSocket(onSuccess, onMessage)
		}
		//连接成功建立的回调方法
		this.websocket.onopen = () => {
			console.log('%c WebSocket连接成功', 'color:#1098f3')
			Toast.hideToast()
			this.isConnecting = false
			this.heartbeat()
			onSuccess()
		}
		//接收到消息的回调方法
		this.websocket.onmessage = event => {
			const data = JSON.parse(event.data)
			onMessage(data)
		}
		//连接关闭的回调方法
		this.websocket.onclose = () => {
			console.log('%c WebSocket连接关闭', 'color:#7f8b3a')
		}
	}

	//发送消息
	send(data: SocketDataType) {
		this.websocket?.send(JSON.stringify(data))
	}

	//关闭连接
	closeSocket() {
		this.websocket?.close()
	}

	//加入聊天室
	joinChatRoom(name: string, userName: string) {
		this.send({
			cmd: 'joinChatRoom',
			data: {
				name,
				userName
			}
		})
	}
}

export const socket = new Socket(import.meta.env.PROD ? 'wss://www.ling0523.cn/chat/' : 'ws://localhost:3060')
