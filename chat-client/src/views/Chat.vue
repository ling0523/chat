<template>
	<div class="page">
		<!-- PC端 -->
		<div class="chat mvi-hidden-down-xs">
			<div class="chat-win mvi-shadow">
				<div class="chat-header">
					<span class="chat-name">{{ name }}（{{ userList.length }}）</span>
					<m-icon @click="exit" class="chat-close" type="switch" size="20px" />
				</div>
				<div class="chat-body">
					<div class="chat-top">
						<div ref="chatRef" class="chat-records">
							<div class="chat-records-item" v-for="item in messageList">
								<div v-if="item.isNotify" class="chat-records-notify">
									<span>{{ dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss') }}</span>
									<span>{{ item.message }}</span>
								</div>
								<template v-else>
									<div class="chat-records-header">
										<span>{{ item.userName }}：</span>
										<span>{{ dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss') }}</span>
									</div>
									<div v-if="item.message" class="chat-records-message">{{ item.message }}</div>
									<div v-else-if="item.code" class="chat-records-code">
										<span @click="openCodeModal(false, item.code)">点击查看代码内容</span>
									</div>
									<div v-else-if="item.filePath" class="chat-records-file">
										<!-- 图片 -->
										<m-image v-if="item.fileType == 'image'" :src="item.filePath" fit="response" class="chat-records-image mvi-cursor-pointer" @click="openPreview(item.filePath)"></m-image>
										<!-- 视频 -->
										<video v-else-if="item.fileType == 'video'" :src="item.filePath" autoplay controls muted class="chat-records-video"></video>
										<!-- 音频 -->
										<audio v-else-if="item.fileType == 'audio'" controls muted autoplay></audio>
										<!-- 其他 -->
										<a v-else class="chat-records-link" :href="item.filePath" :download="item.fileName" target="_blank">
											<span>{{ item.fileName }}</span>
											<!-- pdf -->
											<img v-if="item.fileType == 'pdf'" src="../assets/PDF.svg" />
											<!-- 7z -->
											<img v-else-if="item.fileType == '7z'" src="../assets/7Z.svg" />
											<!-- zip -->
											<img v-else-if="item.fileType == 'zip'" src="../assets/ZIP.svg" />
											<!-- doc -->
											<img v-else-if="item.fileType == 'doc'" src="../assets/DOC.svg" />
											<!-- docx -->
											<img v-else-if="item.fileType == 'docx'" src="../assets/DOCX.svg" />
											<!-- exe -->
											<img v-else-if="item.fileType == 'exe'" src="../assets/EXE.svg" />
											<!-- html -->
											<img v-else-if="item.fileType == 'html'" src="../assets/HTML.svg" />
											<!-- ppt -->
											<img v-else-if="item.fileType == 'ppt'" src="../assets/PPT.svg" />
											<!-- rar -->
											<img v-else-if="item.fileType == 'rar'" src="../assets/RAR.svg" />
											<!-- txt -->
											<img v-else-if="item.fileType == 'txt'" src="../assets/TXT.svg" />
											<!-- wps -->
											<img v-else-if="item.fileType == 'wps'" src="../assets/WPS.svg" />
											<!-- xls -->
											<img v-else-if="item.fileType == 'xls'" src="../assets/XLS.svg" />
											<!-- xlsx -->
											<img v-else-if="item.fileType == 'xlsx'" src="../assets/XLSX.svg" />
											<!-- 通用 -->
											<img v-else src="../assets/TONGYONG.svg" />
										</a>
									</div>
								</template>
							</div>
						</div>
						<div class="chat-users">
							<div class="chat-users-header"><m-icon type="user-group-alt" class="mvi-mr-1" />在线人员</div>
							<div class="chat-users-list">
								<div v-for="item in userList">
									<m-icon type="user-alt" />
									<span class="mvi-ml-1">{{ item }}{{ item == userName ? '（自己）' : '' }}</span>
								</div>
							</div>
						</div>
					</div>
					<div class="chat-bottom">
						<div class="chat-input">
							<textarea v-model.trim="message" @keyup.shift.enter.exact="insertBreak" @keydown.enter.prevent.exact @keyup.enter.exact="sendMessage" placeholder="在此输入..."></textarea>
						</div>
						<div class="chat-btn">
							<m-tooltip class="mvi-mr-2" trigger="hover" title="发送代码片段">
								<m-button @click="openCodeModal(true)" size="small" type="error">
									<span class="mvi-px-1"><m-icon type="code" /></span>
								</m-button>
							</m-tooltip>
							<m-tooltip class="mvi-mr-2" trigger="hover" title="发送文件">
								<m-button v-upload="uploadOptions" size="small" type="success">
									<span class="mvi-px-1"><m-icon type="folder" /></span>
								</m-button>
							</m-tooltip>
							<m-button :disabled="!message" @click="sendMessage" size="small" type="primary">
								<m-icon type="send-alt" />
								<span class="mvi-ml-1">Enter</span>
							</m-button>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- 移动端 -->
		<div class="chatm mvi-hidden-up-sm">
			<div class="chatm-header">
				<span class="chatm-name">{{ name }}（{{ userList.length }}）</span>
				<div>
					<m-icon @click="peopleShow = !peopleShow" class="mvi-mr-4" type="user-group-alt" size="18px" />
					<m-icon @click="exit" type="switch" size="18px" />
				</div>
			</div>
			<div class="chatm-records" ref="chatmRef">
				<div class="chatm-records-item" v-for="item in messageList">
					<div v-if="item.isNotify" class="chatm-records-notify">
						<span>{{ dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss') }}</span>
						<span>{{ item.message }}</span>
					</div>
					<template v-else>
						<div class="chatm-records-header">
							<span>{{ item.userName }}：</span>
							<span>{{ dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss') }}</span>
						</div>
						<div v-if="item.message" class="chatm-records-message">{{ item.message }}</div>
						<div v-else-if="item.code" class="chatm-records-code">
							<span @click="openCodeModal(false, item.code)">点击查看代码内容</span>
						</div>
						<div v-else-if="item.filePath" class="chatm-records-file">
							<!-- 图片 -->
							<m-image v-if="item.fileType == 'image'" :src="item.filePath" class="chatm-records-image" fit="response" @click="openPreview(item.filePath)"></m-image>
							<!-- 视频 -->
							<video v-else-if="item.fileType == 'video'" :src="item.filePath" autoplay controls muted class="chatm-records-video"></video>
							<!-- 音频 -->
							<audio v-else-if="item.fileType == 'audio'" controls muted autoplay></audio>
							<!-- 其他 -->
							<a v-else class="chatm-records-link" :href="item.filePath" :download="item.fileName" target="_blank">
								<span>{{ item.fileName }}</span>
								<!-- pdf -->
								<img v-if="item.fileType == 'pdf'" src="../assets/PDF.svg" />
								<!-- 7z -->
								<img v-else-if="item.fileType == '7z'" src="../assets/7Z.svg" />
								<!-- zip -->
								<img v-else-if="item.fileType == 'zip'" src="../assets/ZIP.svg" />
								<!-- doc -->
								<img v-else-if="item.fileType == 'doc'" src="../assets/DOC.svg" />
								<!-- docx -->
								<img v-else-if="item.fileType == 'docx'" src="../assets/DOCX.svg" />
								<!-- exe -->
								<img v-else-if="item.fileType == 'exe'" src="../assets/EXE.svg" />
								<!-- html -->
								<img v-else-if="item.fileType == 'html'" src="../assets/HTML.svg" />
								<!-- ppt -->
								<img v-else-if="item.fileType == 'ppt'" src="../assets/PPT.svg" />
								<!-- rar -->
								<img v-else-if="item.fileType == 'rar'" src="../assets/RAR.svg" />
								<!-- txt -->
								<img v-else-if="item.fileType == 'txt'" src="../assets/TXT.svg" />
								<!-- wps -->
								<img v-else-if="item.fileType == 'wps'" src="../assets/WPS.svg" />
								<!-- xls -->
								<img v-else-if="item.fileType == 'xls'" src="../assets/XLS.svg" />
								<!-- xlsx -->
								<img v-else-if="item.fileType == 'xlsx'" src="../assets/XLSX.svg" />
								<!-- 通用 -->
								<img v-else src="../assets/TONGYONG.svg" />
							</a>
						</div>
					</template>
				</div>
			</div>
			<div class="chatm-footer">
				<div class="chatm-input">
					<textarea v-model.trim="message" @keyup.shift.enter.exact="insertBreak" @keydown.enter.prevent.exact @keyup.enter.exact="sendMessage" placeholder="在此输入..."></textarea>
				</div>
				<div class="chatm-btn">
					<m-button @click="openCodeModal(true)" size="small" type="error" class="mvi-mr-2">
						<span class="mvi-px-1"><m-icon type="code" /></span>
					</m-button>
					<m-button v-upload="uploadOptions" size="small" type="success" class="mvi-mr-2">
						<span class="mvi-px-1"><m-icon type="folder" /></span>
					</m-button>
					<m-button :disabled="!message" @click="sendMessage" size="small" type="primary">
						<m-icon type="send-alt" />
						<span class="mvi-ml-1">Enter</span>
					</m-button>
				</div>
			</div>
		</div>
		<!-- 图片预览 -->
		<m-image-preview mount-el="body" v-model="previewShow" closable :images="previewImages"></m-image-preview>
		<!-- 移动端人员在线列表弹窗 -->
		<m-popup mount-el="body" v-model="peopleShow" placement="right" closable show-times width="180px">
			<div class="chatm-users-header"><m-icon type="user-group-alt" class="mvi-mr-1" />在线人员</div>
			<div class="chatm-users-list">
				<div v-for="item in userList">
					<m-icon type="user-alt" />
					<span class="mvi-ml-1">{{ item }}{{ item == userName ? '（自己）' : '' }}</span>
				</div>
			</div>
		</m-popup>
		<!-- 代码片段弹窗 -->
		<m-modal v-model="codeShow" closable show-times title="代码片段" width="90%" mount-el="body">
			<VueCodemirror :disabled="!isCodeEdit" v-model="codeValue" autofocus placeholder="输入代码..." :tabSize="4" :extensions="extensions"></VueCodemirror>
			<template #footer v-if="isCodeEdit">
				<m-button :disabled="!codeValue" @click="sendCode" size="small" type="primary">
					<m-icon type="send-alt" />
					<span class="mvi-ml-1">Enter</span>
				</m-button>
			</template>
		</m-modal>
	</div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
import { Dialog, Toast, UploadOptionsType } from 'mvi-web-plus'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Dap from 'dap-util'
import { socket, SocketDataType } from './Socket'
import { customNotify } from './Notification'
import { vue } from '@codemirror/lang-vue'
import { oneDark } from '@codemirror/theme-one-dark'
const route = useRoute()
const store = useStore()
const router = useRouter()

//输入框的值
const message = ref('')
//消息内容主体
const chatRef = ref<HTMLElement | null>(null)
const chatmRef = ref<HTMLElement | null>(null)
//放大图片数组
const previewImages = ref<string[]>([])
//上传配置
const uploadOptions = ref<UploadOptionsType>({
	multiple: false,
	async select(files: File[]) {
		Toast.showToast({
			type: 'loading',
			message: '正在发送...'
		})
		const file = files[0]
		const path = await Dap.file.dataFileToBase64(file)
		socket.send({
			cmd: 'file',
			data: {
				filePath: path,
				fileName: file.name,
				fileType: getFileType(file)
			}
		})
		Toast.hideToast()
	}
})
//codemirror配置
const extensions = ref<any[]>([[vue(), oneDark]])
//页面是否激活
const isPageActive = ref<boolean>(true)
//人员列表弹窗是否显示
const peopleShow = ref<boolean>(false)
//图片预览弹窗是否显示
const previewShow = ref<boolean>(false)
//代码弹窗是否显示
const codeShow = ref<boolean>(false)
//代码内容
const codeValue = ref('')
//代码是否可编辑
const isCodeEdit = ref<boolean>(true)
//房间名称
const name = computed(() => {
	return decodeURIComponent(route.params.name as string)
})
//用户名称
const userName = computed(() => {
	return store.getters.userName
})
//聊天室人员
const userList = ref<string[]>([])
//消息队列
const messageList = ref<
	{
		userName: string //消息用户名称
		timestamp: number //时间戳
		message?: string //消息内容
		filePath?: string //文件路径
		fileName?: string //文件名称
		fileType?: string //文件类型
		code?: string //代码
		isNotify: boolean //是否通知
	}[]
>([])

//获取文件类型
const getFileType = (file: File) => {
	//图片
	if (file.type.startsWith('image/')) {
		return 'image'
	}
	//视频
	if (file.type.startsWith('video/')) {
		return 'video'
	}
	//音频
	if (file.type.startsWith('audio/')) {
		return 'audio'
	}
	//pdf
	if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
		return 'pdf'
	}
	//7z压缩包
	if (file.type === 'application/x-7z-compressed' || file.name.toLowerCase().endsWith('.7z')) {
		return '7z'
	}
	//zip压缩包
	if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.toLowerCase().endsWith('.zip')) {
		return 'zip'
	}
	//doc
	if (file.type === 'application/msword' || file.name.toLowerCase().endsWith('.doc')) {
		return 'doc'
	}
	//docx
	if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx')) {
		return 'docx'
	}
	//exe
	if (['application/x-msdownload', 'application/octet-stream'].includes(file.type) || file.name.toLowerCase().endsWith('.exe')) {
		return 'exe'
	}
	//html
	if (file.type === 'text/html' || file.name.toLowerCase().endsWith('.html')) {
		return 'html'
	}
	//ppt
	if (['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type) || file.name.toLowerCase().endsWith('.ppt') || file.name.toLowerCase().endsWith('.pptx')) {
		return 'ppt'
	}
	//rar
	if (file.type == 'application/x-rar-compressed' || file.name.toLowerCase().endsWith('.rar')) {
		return 'rar'
	}
	//txt
	if (file.type == 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
		return 'txt'
	}
	//wps
	if (['application/vnd.ms-works', 'application/vnd.lotus-wordpro'].includes(file.type)) {
		return 'wps'
	}
	//xls
	if (file.type == 'application/vnd.ms-excel' || file.name.toLowerCase().endsWith('.xls')) {
		return 'xls'
	}
	//xlsx
	if (file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.toLowerCase().endsWith('.xlsx')) {
		return 'xlsx'
	}
	return ''
}
//输入名称弹窗方法
const showPrompt = () => {
	Dialog.Prompt({
		title: '起个好名字',
		message: '让别人知道你是谁：',
		input: {
			placeholder: '输入一个名字...'
		}
	}).then(res => {
		if (res.ok && res.value) {
			store.commit('userName', res.value)
		} else {
			showPrompt()
		}
	})
}
//退出聊天室
const exit = () => {
	Dialog.Confirm({
		title: '确定退出聊天室吗？',
		message: '退出后无法再与聊天室内的成员发送消息',
		btns: {
			ok: {
				size: 'small'
			},
			cancel: {
				size: 'small'
			}
		}
	}).then(res => {
		if (res) {
			router.replace({
				name: 'home'
			})
		}
	})
}
//发送消息
const sendMessage = () => {
	if (!message.value) {
		return
	}
	socket.send({
		cmd: 'message',
		data: {
			//消息
			message: message.value
		}
	})
	message.value = ''
}
//打开代码片段弹窗
const openCodeModal = (isEdit: boolean, code: string | undefined = '') => {
	isCodeEdit.value = isEdit
	if (isCodeEdit.value) {
		codeValue.value = ''
	} else {
		codeValue.value = code
	}
	codeShow.value = true
}
//发送代码片段
const sendCode = () => {
	if (!codeValue.value) {
		return
	}
	if (!isCodeEdit.value) {
		return
	}
	socket.send({
		cmd: 'code',
		data: {
			code: codeValue.value
		}
	})
	codeValue.value = ''
	codeShow.value = false
}
//换行
const insertBreak = (e: InputEvent) => {
	message.value += '\n'
	const elm = e.currentTarget as HTMLElement
	nextTick(() => {
		Dap.element.setScrollTop({
			el: elm,
			time: 0,
			number: Dap.element.getScrollHeight(elm)
		})
	})
}
//图片预览
const openPreview = (filePath: string) => {
	previewImages.value = [filePath]
	previewShow.value = true
}
//处理消息
const handleMessage = (data: SocketDataType) => {
	console.log(data)
	//心跳检测跳过
	if (data.cmd == 'heartbeat') {
		return
	}
	//有人加入聊天室
	if (data.cmd == 'joinChatRoom') {
		userList.value = data.data!.userList as string[]
		//给新加入的人恢复聊天记录
		if (data.data!.userName == userName.value) {
			//先清除之前的聊天内容
			messageList.value = []
			data.data!.history.forEach((item: any) => {
				//文件类型消息
				if (item.filePath) {
					messageList.value.push({
						userName: item.userName,
						fileType: item.fileType,
						fileName: item.fileName,
						filePath: item.filePath,
						timestamp: item.timeStamp,
						isNotify: false
					})
				}
				//代码消息
				else if (item.code) {
					messageList.value.push({
						userName: item.userName,
						code: item.code,
						timestamp: item.timeStamp,
						isNotify: false
					})
				}
				//普通消息
				else {
					messageList.value.push({
						userName: item.userName,
						message: item.message,
						timestamp: item.timeStamp,
						isNotify: false
					})
				}
			})
		}
		messageList.value.push({
			userName: data.data!.userName,
			message: data.data!.userName == userName.value ? '你已加入聊天室' : `${data.data!.userName}加入了聊天室`,
			timestamp: data.data!.timeStamp,
			isNotify: true
		})
		//给其他人发送通知
		if (!isPageActive.value && data.data!.userName != userName.value) {
			customNotify.send(`${data.data!.userName}加入了聊天室`)
		}
		return
	}
	//有人退出聊天室
	if (data.cmd == 'exitChatRoom') {
		userList.value = data.data!.userList as string[]
		messageList.value.push({
			userName: data.data!.userName,
			message: `${data.data!.userName}退出了聊天室`,
			timestamp: data.data!.timeStamp,
			isNotify: true
		})
		if (!isPageActive.value && data.data!.userName != userName.value) {
			customNotify.send(`${data.data!.userName}退出了聊天室`)
		}
		return
	}
	//有人发送消息
	if (data.cmd == 'message') {
		messageList.value.push({
			userName: data.data!.userName,
			message: data.data!.message,
			timestamp: data.data!.timeStamp,
			isNotify: false
		})
		if (!isPageActive.value) {
			customNotify.send(`${data.data!.userName}：${data.data!.message}`)
		}
		return
	}
	//有人发送文件
	if (data.cmd == 'file') {
		messageList.value.push({
			userName: data.data!.userName,
			fileType: data.data!.fileType,
			fileName: data.data!.fileName,
			filePath: data.data!.filePath,
			timestamp: data.data!.timeStamp,
			isNotify: false
		})
		if (!isPageActive.value) {
			customNotify.send(`${data.data!.userName}发送了文件：${data.data!.fileName}`)
		}
		return
	}
	//有人发送代码
	if (data.cmd == 'code') {
		messageList.value.push({
			userName: data.data!.userName,
			code: data.data!.code,
			timestamp: data.data!.timeStamp,
			isNotify: false
		})
		if (!isPageActive.value) {
			customNotify.send(`${data.data!.userName}发送了一段代码`)
		}
		return
	}
}

//不存在用户名称
if (!userName.value) {
	showPrompt()
}

//监听用户名称变化
watch(
	() => userName.value,
	newVal => {
		if (newVal) {
			socket.initSocket(
				//socket连接成功
				() => {
					socket.joinChatRoom(name.value, userName.value)
				},
				//接收消息
				(data: SocketDataType) => {
					handleMessage(data)
				}
			)
		}
	},
	{
		immediate: true
	}
)
//监听消息列表变化
watch(
	() => messageList.value,
	() => {
		nextTick(() => {
			Dap.element.setScrollTop({
				el: chatRef.value!,
				time: 0,
				number: Dap.element.getScrollHeight(chatRef.value!)
			})
			Dap.element.setScrollTop({
				el: chatmRef.value!,
				time: 0,
				number: Dap.element.getScrollHeight(chatmRef.value!)
			})
		})
	},
	{
		deep: true
	}
)

//监听页面显示隐藏
Dap.event.on(window, 'visibilitychange', () => {
	isPageActive.value = document.visibilityState == 'visible'
})

onBeforeUnmount(() => {
	socket.closeSocket()
})
</script>
<style lang="less" scoped>
@import url('../styles/index.less');
.chat {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	min-width: 820px;
	min-height: 620px;

	.chat-win {
		display: block;
		width: 800px;
		height: 600px;
		background-color: #fff;
		border-radius: 4px;

		.chat-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			height: 50px;
			padding: 0 20px;
			color: #fff;
			background-color: @color;

			.chat-name {
				font-size: 22px;
				font-weight: bold;
			}

			.chat-close {
				opacity: 0.8;
				transition: opacity 200ms;

				&:hover {
					cursor: pointer;
					opacity: 1;
				}
			}
		}

		.chat-body {
			display: block;
			width: 100%;
			height: calc(100% - 50px);

			.chat-top {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				width: 100%;
				height: calc(100% - 180px);

				.chat-records {
					display: block;
					width: calc(100% - 180px);
					height: 100%;
					padding: 10px;
					overflow-x: hidden;
					overflow-y: auto;

					.chat-records-item {
						display: block;
						width: 100%;
						margin-bottom: 20px;
						padding: 0 10px;

						.chat-records-notify {
							display: block;
							width: 100%;
							text-align: center;
							font-size: 12px;
							color: #bbb;

							& > span:first-child {
								margin-right: 10px;
							}
						}

						.chat-records-header {
							display: flex;
							justify-content: flex-start;
							align-items: center;
							width: 100%;
							margin-bottom: 5px;
							vertical-align: middle;

							& > span:first-child {
								font-weight: bold;
								color: @color;
								margin-right: 5px;
							}

							& > span:last-child {
								font-size: 12px;
								opacity: 0.5;
							}
						}

						.chat-records-message {
							display: block;
							width: 100%;
							color: #333;
							font-size: 14px;
							padding: 0 15px;
							white-space: pre-wrap;
						}

						.chat-records-code {
							display: block;
							width: 100%;
							padding: 0 15px;

							span {
								color: #f30;
								opacity: 0.8;
								transition: all 200ms;
								display: inline-block;

								&:hover {
									cursor: pointer;
									text-decoration: underline;
									opacity: 1;
								}
							}
						}

						.chat-records-file {
							display: block;
							width: 100%;
							padding: 0 15px;

							.chat-records-image {
								width: 100px;
								height: 100px;
								border-radius: 2px;
							}

							.chat-records-video {
								width: 240px;
								height: auto;
								border-radius: 2px;
							}

							.chat-records-link {
								display: inline-flex;
								justify-content: flex-start;
								align-items: center;
								color: #999;

								&:hover {
									cursor: pointer;
									text-decoration: underline;
								}

								img {
									display: block;
									width: 30px;
									margin-left: 5px;
								}
							}
						}

						&:last-child {
							margin-bottom: 0;
						}
					}
				}

				.chat-users {
					display: block;
					width: 180px;
					height: 100%;
					border-left: 6px solid #f7f8fa;

					.chat-users-header {
						display: flex;
						justify-content: flex-start;
						align-items: center;
						width: 100%;
						height: 40px;
						padding: 0 10px;
						color: @color;
						font-weight: bold;
						position: relative;

						&::before {
							position: absolute;
							bottom: 5px;
							left: 10px;
							height: 1px;
							width: calc(100% - 10px);
							background-color: fade(@color, 30%);
							content: '';
						}
					}

					.chat-users-list {
						display: block;
						width: 100%;
						padding: 0 20px;
						height: calc(100% - 40px);
						overflow-x: hidden;
						overflow-y: auto;

						& > div {
							display: flex;
							justify-content: flex-start;
							align-items: center;
							width: 100%;
							color: #34ae75;
							padding: 5px 0;
							opacity: 0.8;
							transition: all 200ms;

							&:hover {
								cursor: pointer;
								opacity: 1;
							}

							& > span {
								text-overflow: ellipsis;
								white-space: nowrap;
								overflow: hidden;
							}
						}
					}
				}
			}

			.chat-bottom {
				display: block;
				width: 100%;
				height: 180px;
				border-top: 6px solid #f7f8fa;

				.chat-input {
					display: block;
					width: 100%;
					height: calc(100% - 46px);
					padding: 10px 20px;

					textarea {
						appearance: none;
						border: none;
						width: 100%;
						height: 100%;
						resize: none;
						font-size: 14px;
						font-family: inherit;
						color: #333;

						&::placeholder {
							opacity: 0.5;
						}
					}
				}

				.chat-btn {
					display: flex;
					justify-content: flex-end;
					align-items: center;
					width: 100%;
					height: 46px;
					padding: 0 20px 10px 0;
				}
			}
		}
	}
}

.chatm {
	display: block;
	width: 100%;
	height: 100%;
	background-color: #fff;

	.chatm-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 50px;
		padding: 0 20px;
		color: #fff;
		background-color: @color;

		.chatm-name {
			font-size: 18px;
			font-weight: bold;
		}
	}

	.chatm-records {
		display: block;
		width: 100%;
		height: calc(100% - 230px);
		padding: 10px;
		overflow-x: hidden;
		overflow-y: auto;

		.chatm-records-item {
			display: block;
			width: 100%;
			margin-bottom: 10px;

			.chatm-records-notify {
				display: block;
				width: 100%;
				text-align: center;
				font-size: 12px;
				color: #bbb;

				& > span:first-child {
					margin-right: 10px;
				}
			}

			.chatm-records-header {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				width: 100%;
				margin-bottom: 5px;
				vertical-align: middle;

				& > span:first-child {
					font-weight: bold;
					color: @color;
					margin-right: 5px;
				}

				& > span:last-child {
					font-size: 12px;
					opacity: 0.5;
				}
			}

			.chatm-records-message {
				display: block;
				width: 100%;
				color: #333;
				font-size: 14px;
				padding-left: 10px;
				white-space: pre-wrap;
			}

			.chatm-records-code {
				display: block;
				width: 100%;
				padding: 0 15px;

				span {
					color: #f30;
					opacity: 0.8;
					transition: all 200ms;
					display: inline-block;

					&:hover {
						cursor: pointer;
						text-decoration: underline;
						opacity: 1;
					}
				}
			}

			.chatm-records-file {
				display: block;
				width: 100%;
				padding: 0 10px;

				.chatm-records-image {
					width: 100px;
					height: 100px;
					border-radius: 2px;
				}

				.chatm-records-video {
					width: 100%;
					height: auto;
					border-radius: 2px;
				}

				.chatm-records-link {
					display: inline-flex;
					justify-content: flex-start;
					align-items: center;
					color: #999;

					img {
						display: block;
						width: 30px;
						margin-left: 5px;
					}
				}
			}

			&:last-child {
				margin-bottom: 0;
			}
		}
	}

	.chatm-footer {
		display: block;
		width: 100%;
		height: 180px;
		border-top: 6px solid #f7f8fa;

		.chatm-input {
			display: block;
			width: 100%;
			height: calc(100% - 46px);
			padding: 10px;

			textarea {
				appearance: none;
				border: none;
				width: 100%;
				height: 100%;
				resize: none;
				font-size: 14px;
				font-family: inherit;
				color: #333;

				&::placeholder {
					opacity: 0.5;
				}
			}
		}

		.chatm-btn {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			width: 100%;
			height: 46px;
			padding: 0 10px 10px 0;
		}
	}
}

.chatm-users-header {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	width: 100%;
	height: 40px;
	padding: 0 10px;
	color: @color;
	font-weight: bold;
	position: relative;

	&::before {
		position: absolute;
		bottom: 5px;
		left: 10px;
		height: 1px;
		width: calc(100% - 10px);
		background-color: fade(@color, 30%);
		content: '';
	}
}

.chatm-users-list {
	display: block;
	width: 100%;
	padding: 0 20px;
	height: calc(100% - 40px);
	overflow-x: hidden;
	overflow-y: auto;

	& > div {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		width: 100%;
		color: #34ae75;
		padding: 5px 0;

		& > span {
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
		}
	}
}
</style>
