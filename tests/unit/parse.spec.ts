/* eslint-disable @typescript-eslint/no-explicit-any */
import { parse, validate } from "@/utils/parse";

test("script", () => {
    expect(
        JSON.stringify(
            parse(`
# comment
Case welcome
    Speak $name+"您好，请问有什么可以帮您?"
    Listen 5
    Branch "退出", exitProc
    Branch "没有", exitProc
    Default exitProc
Case exitProc
    Speak "感谢您的使用，再见。"
    Exit`)
        )
    ).toBe(
        "{\"hashTable\":{\"welcome\":{\"line\":1,\"speak\":[{\"type\":\"var\",\"args\":\"$name\",\"line\":2},{\"type\":\"string\",\"args\":\"您好，请问有什么可以帮您?\",\"line\":2}],\"listen\":{\"time\":5,\"line\":3},\"branch\":[{\"answer\":\"退出\",\"nextStepId\":\"exitProc\",\"line\":4},{\"answer\":\"没有\",\"nextStepId\":\"exitProc\",\"line\":5}],\"default\":{\"args\":\"exitProc\",\"line\":6}},\"exitProc\":{\"line\":7,\"speak\":[{\"type\":\"string\",\"args\":\"感谢您的使用，再见。\",\"line\":8}]}},\"entry\":\"welcome\",\"exitStep\":[\"exitProc\"],\"vars\":{\"$name\":\"\"}}"
    );
});


test("Test wrong script: No step", () => {
    expect(() => {
        parse("");
    }).toThrow("Expected at least one step");
});


const ast = JSON.parse(
    '{"hashTable": {"welcome": {"speak": [{ "type": "var", "args": "$name", "line": 2 },{"type": "string","args": "您好，请问有什么可以帮您?","line": 2}],"branch": [{ "answer": "投诉", "nextStepId": "complainProc", "line": 4 },{ "answer": "账单", "nextStepId": "billProc", "line": 5 }],"silence": { "args": "silenceProc", "line": 6 }},"complainProc": {"line": 8,"speak": [{"type": "string","args": "您的意见是我们改进工作的动力，请问您还有什么补充?","line": 9}],"listen": { "time": 5, "line": 10 },"default": { "args": "thanks", "line": 11 }},"thanks": {"line": 12,"speak": [{ "type": "string", "args": "感谢您的来电，再见", "line": 13 }]},"billProc": {"line": 15,"speak": [{ "type": "string", "args": "您的本月账单是", "line": 16 },{ "type": "var", "args": "$amount", "line": 16 },{"type": "string","args": "元，感谢您的来电，再见","line": 16}]},"silenceProc": {"line": 18,"speak": [{"type": "string","args": "听不清，请您大声一点可以吗?","line": 19}],"listen": { "time": 5, "line": 20 },"branch": [{ "answer": "投诉", "nextStepId": "complainProc", "line": 21 },{ "answer": "账单", "nextStepId": "billProc", "line": 22 }],"silence": { "args": "silenceProc", "line": 23 },"default": { "args": "defaultProc", "line": 24 }},"defaultProc": {"line": 25,"speak": [{"type": "string","args": "抱歉，我不明白你的意思","line": 26}],"branch": [{ "answer": "投诉", "nextStepId": "complainProc", "line": 27 },{ "answer": "账单", "nextStepId": "billProc", "line": 28 }],"silence": { "args": "silenceProc", "line": 29 },"default": { "args": "defaultProc", "line": 30 }}},"entry": "welcome","exitStep": ["thanks", "billProc"],"vars": { "$name": "", "$amount": "" }}'
);

test("Test wrong ast: no line", () => {
    expect(() => {
        validate(ast);
    }).toThrow("Expected default step.");
});

const ast2 = JSON.parse(
    '{"hashTable": {"welcome": {"line": 1,"speak": [{ "type": "var", "args": "$name", "line": 2 },{"type": "string","args": "您好，请问有什么可以帮您?","line": 2}],"listen": { "time": 5, "line": 3 },"branch": [{ "answer": "投诉", "nextStepId": "complainProc", "line": 4 },{ "answer": "账单", "nextStepId": "billProc", "line": 5 }],"silence": { "args": "silenceProc", "line": 6 }},"complainProc": {"line": 8,"speak": [{"type": "string","args": "您的意见是我们改进工作的动力，请问您还有什么补充?","line": 9}],"listen": { "time": 5, "line": 10 },"default": { "args": "thanks", "line": 11 }},"thanks": {"line": 12,"speak": [{ "type": "string", "args": "感谢您的来电，再见", "line": 13 }]},"billProc": {"line": 15,"speak": [{ "type": "string", "args": "您的本月账单是", "line": 16 },{ "type": "var", "args": "$amount", "line": 16 },{"type": "string","args": "元，感谢您的来电，再见","line": 16}]},"silenceProc": {"line": 18,"speak": [{"type": "string","args": "听不清，请您大声一点可以吗?","line": 19}],"listen": { "time": 5, "line": 20 },"branch": [{ "answer": "投诉", "nextStepId": "complainProc", "line": 21 },{ "answer": "账单", "nextStepId": "billProc", "line": 22 }],"silence": { "args": "silenceProc", "line": 23 },"default": { "args": "defaultProc", "line": 24 }},"defaultProc": {"line": 25,"speak": [{"type": "string","args": "抱歉，我不明白你的意思","line": 26}],"branch": [{ "answer": "投诉", "nextStepId": "complainProc", "line": 27 },{ "answer": "账单", "nextStepId": "billProc", "line": 28 }],"silence": { "args": "silenceProc", "line": 29 },"default": { "args": "defaultProc", "line": 30 }}},"entry": "welcome","exitStep": ["thanks", "billProc"],"vars": { "$name": "", "$amount": "" }}'
);

test("Test wrong ast: no defaultList", () => {
    expect(() => {
        validate(ast2);
    }).toThrow();
});

