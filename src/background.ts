import { reactive} from "vue";
import { parse } from "./utils/parse";
import {  ENV } from "./utils/interface";

const usingscript = `
# comment
case welcome
    Speak "您好，请问有什么可以帮您?"
    choose "退出", exitProc
    choose "没有", exitProc
    Default exitProc
case exitProc
    Speak "感谢您的使用，再见。"
    Exit`
;
const ast = parse(usingscript) ;
export const Background = reactive({
    activeCode: usingscript,
    defaultCode: String,
    ast: ast,
    userList: {} as {
        [key: string]: {
            username: string;
            env: ENV;
            messageList: {
                author: string;
                type: string;
                data: { text: string };
            }[];
        };
    },
});
