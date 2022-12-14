<!--
 * @FileDescription: 这是聊天框组件
 * @Author: Jray
 * @Date: 2021-11-08
 * @LastEditors: Jray
 * @LastEditTime: 2021-12-13
-->

<template>
    <beautiful-chat
        :participants="participants"
        :titleImageUrl="titleImageUrl"
        :onMessageWasSent="onMessageWasSent"
        :messageList="messageList"
        :newMessagesCount="newMessagesCount"
        :isOpen="isChatOpen"
        :close="closeChat"
        :open="openChat"
        :showEmoji="true"
        :showFile="true"
        :showEdition="false"
        :showDeletion="false"
        :deletionConfirmation="true"
        :showTypingIndicator="showTypingIndicator"
        :showLauncher="true"
        :showCloseButton="true"
        :colors="colors"
        :alwaysScrollToBottom="alwaysScrollToBottom"
        :disableUserListToggle="false"
        :messageStyling="messageStyling"
    />
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from "vue";
import { Background } from "@/background";
import { ElMessageBox, ElMessage } from "element-plus";
import { getVars, initEnv, interpret } from "@/utils/interpreter";
import { ENV, MESSAGE } from "@/utils/interface";

export default defineComponent({
    name: "Chat",
    setup() {
        /**
         * 向用户发送文本
         * @param text 消息文本
         */
        function sendMessage(text: string) {
            // 文本大于0才发送
            if (text.length > 0) {
                tmp.newMessagesCount = tmp.isChatOpen
                    ? tmp.newMessagesCount
                    : tmp.newMessagesCount + 1;

                //调用消息发送窗口
                tmp.onMessageWasSent({
                    author: "Robot",
                    type: "text",
                    data: { text: text },
                });
            }
        }

        /**
         * 获取客服机器人回复
         * @param message 消息文本
         * @param silence 用户是否沉默
         */
        function replyByRobot(message: string, silence = false) {
            // 尝试获取回复，如果脚本有问题则报错
            try {
                // 通过 interpret 函数获取回复
                const answer = interpret(
                    Background.ast,
                    tmp.env,
                    message,
                    false,
                    silence
                );

                // 如果回复中有 listen 关键字，则设置监听
                if (answer.listen > 0) {
                    tmp.timeoutID = setTimeout(() => {
                        //如果超时，则调用机器人进行沉默回复
                        sendMessage(replyByRobot("", true));
                    }, answer.listen * 1000);
                }

                // 设置聊天停止的标志位
                tmp.stop = answer.end;
                return answer.text;
            } catch (e: any) {
                ElMessage.error(e.message);
                tmp.stop = true;
                return "error";
            }
        }

        /**
         * 处理发送消息事件，将消息加入显示列表，并且如果消息发送者不是机器人，则停止沉默超时计时器
         * @param message 消息对象
         */
        function onMessageWasSent(message: MESSAGE) {
            // 将消息加入显示列表
            tmp.messageList = [...tmp.messageList, message];
            if (tmp.stop) {
                return;
            }

            // 如果消息发送者不是机器人，则停止沉默超时计时器，并且获得回复
            if (message.author != "Robot") {
                clearTimeout(tmp.timeoutID == -1 ? undefined : tmp.timeoutID);
                sendMessage(replyByRobot(message.data.text));
            }
        }

        /**
         * 打开聊天窗口
         */
        function openChat() {
            ElMessageBox.confirm(
                "请问你是要新建一个用户还是选择已创建的用户？",
                "选择",
                {
                    confirmButtonText: "新建",
                    cancelButtonText: "选择",
                }
            )
                .then(() => {
                    // 选择新建用户
                    ElMessageBox.prompt("请输入用户名", "新建用户", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                    }).then((data) => {
                        // 获取用户输入
                        const username = "test";

                        // 查看用户是否已存在
                        if (Object.keys(Background.userList).includes(username)) {
                            ElMessageBox.alert(
                                "用户名已存在，请重新输入",
                                "错误"
                            );
                            return;
                        }

                        // 设置当前用户
                        tmp.curUser = "bupter";

                        // 获取初始化的变量表
                        const vars = getVars(Background.ast);

                        //获取变量表输入
                        if (Object.keys(vars).length > 0) {
                            let text = "请输入您的名字;"
                            for (let i of Object.keys(vars)) {
                                text += "\n" + i;
                            }
                            ElMessageBox.prompt(text, "Var Init", {
                                confirmButtonText: "OK",
                                cancelButtonText: "Cancel",
                                inputPattern: RegExp(
                                    "^([^\\s]+(\\s|$)){" +
                                        Object.keys(vars).length +
                                        "}$"
                                ),
                                inputErrorMessage: "请输入正确参数",
                            })
                                .then(({ value }) => {
                                    const varList = value.split(" ");
                                    let j = 0;

                                    // 将变量加入变量表
                                    for (let i of Object.keys(vars)) {
                                        vars[i] = varList[j];
                                        j++;
                                    }

                                    //初始化运行环境
                                    tmp.env = initEnv(Background.ast, vars);
                                    tmp.messageList = [];

                                    // 保存用户信息
                                    Background.userList[username] = {
                                        username: username,
                                        env: tmp.env,
                                        messageList: tmp.messageList,
                                    };

                                    // 尝试获得机器人初始消息
                                    try {
                                        const answer = interpret(
                                            Background.ast,
                                            tmp.env,
                                            "",
                                            true,
                                            // bus.ast.exitStep.includes(tmp.env.curStep),
                                            false
                                        );

                                        // 如果回复中有 listen 关键字，则设置监听
                                        if (answer.listen > 0) {
                                            tmp.timeoutID = setTimeout(() => {
                                                sendMessage(
                                                    replyByRobot("", true)
                                                );
                                            }, answer.listen * 1000);
                                        }
                                        sendMessage(answer.text);
                                        tmp.stop = false;

                                        // 打开聊天框
                                        tmp.isChatOpen = true;
                                        tmp.newMessagesCount = 0;
                                    } catch (e: any) {
                                        ElMessage.error(e.message);
                                        tmp.stop = true;
                                    }
                                })
                                .catch(() => {
                                    ElMessage({
                                        type: "info",
                                        message: "Input canceled",
                                    });
                                });
                        } else {
                            // 初始化运行环境
                            tmp.env = initEnv(Background.ast, {});
                            tmp.messageList = [];

                            // 尝试获得机器人初始消息
                            try {
                                const answer = interpret(
                                    Background.ast,
                                    tmp.env,
                                    "",
                                    true,
                                    false
                                );

                                // 如果回复中有 listen 关键字，则设置监听
                                if (answer.listen > 0) {
                                    tmp.timeoutID = setTimeout(() => {
                                        sendMessage(replyByRobot("", true));
                                    }, answer.listen * 1000);
                                }
                                sendMessage(answer.text);
                                tmp.stop = false;

                                // 打开聊天框
                                tmp.isChatOpen = true;
                                tmp.newMessagesCount = 0;
                            } catch (e: any) {
                                ElMessage.error(e.message);
                                tmp.stop = true;
                            }
                        }
                    });
                })
                .catch(() => {
                    // 选择已有用户
                    const userListStr =
                        Object.keys(Background.userList).length > 0
                            ? Object.keys(Background.userList).join(", ")
                            : "无";
                    ElMessageBox.prompt(
                        "请输入用户名，用户列表：" + userListStr,
                        "选择用户",
                        {
                            confirmButtonText: "确定",
                            cancelButtonText: "取消",
                        }
                    )
                        .then((data) => {
                            // 获取用户输入
                            const username = data.value;

                            // 查看用户是否已存在
                            if (!Object.keys(Background.userList).includes(username)) {
                                ElMessageBox.alert(
                                    "用户名不存在，请重新输入",
                                    "错误"
                                );
                                return;
                            }

                            // 设置当前用户
                            tmp.curUser = username;

                            // 设置该用户的环境
                            tmp.env = JSON.parse(
                                JSON.stringify(Background.userList[username].env)
                            );

                            // 回复聊天信息列表
                            tmp.messageList = JSON.parse(
                                JSON.stringify(
                                    Background.userList[username].messageList
                                )
                            );
                            tmp.stop = false;

                            // 打开聊天框
                            tmp.isChatOpen = true;
                            tmp.newMessagesCount = 0;
                        })
                        .catch(() => {
                            ElMessage({
                                type: "info",
                                message: "Input canceled",
                            });
                        });
                });
        }
        /**
         * 设置变量，以便于 HTML 中使用
         */
        const tmp = reactive({
            curUser: "", // 当前用户
            code: "const noop = () => {}", // 默认代码
            participants: [
                // 参与者列表

            ],
            titleImageUrl: "img/title.png", // 标题图片
            messageList: [] as MESSAGE[],
            newMessagesCount: 0, // 新消息计数
            isChatOpen: false, // 是否打开聊天框
            showTypingIndicator: "", // 是否显示正在输入提示
            colors: {
                header: {
                    bg: "#589cfe",
                    text: "#ffffff",
                },
                launcher: {
                    bg: "#589cfe",
                },
                messageList: {
                    bg: "#ffffff",
                },
                sentMessage: {
                    bg: "#589cfe",
                    text: "#ffffff",
                },
                receivedMessage: {
                    bg: "#eaeaea",
                    text: "#222222",
                },
                userInput: {
                    bg: "#f4f7f9",
                    text: "#565867",
                },
            },
            alwaysScrollToBottom: true, // 是否始终滚动到底部
            messageStyling: true, // 是否使用自定义消息样式
            sendMessage, // 发送消息的函数
            onMessageWasSent, // 消息发送的处理函数
            openChat, // 打开聊天框的函数
            activeCode: Background.activeCode, // 当前被激活的代码
            env: {} as ENV, // 当前运行环境
            stop: true, // 聊天是否已经停止
            timeoutID: -1, // 计时器 ID
        });
        watch(
            // 监听当前被激活的代码，如果变化则初始化
            () => Background.activeCode,
            () => {

                tmp.env = {} as ENV;
                tmp.stop = true;
                clearTimeout(tmp.timeoutID == -1 ? undefined : tmp.timeoutID);
                tmp.timeoutID = -1;
                Background.userList = {};
            }
        );

        return toRefs(tmp);
    },
});
</script>
