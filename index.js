#!/usr/bin/node

"use strict";
/**
 * 抢答器后端，具体使用见接口文档（/docs/API.md）
 * 默认使用以下端口，当然你也可以手动指定
 * - 3000:Websocket服务
 * - 8090:HTTP服务
 * - 8091:TCP服务
 */

const WS_PORT = 3000;
const HTTP_PORT = 8090;
const TCP_PORT = 8091;

/**
 * 可以接受的抢答器延迟，毫秒
 */
let ACC_GAP = 30;

//WebSocket
const WebSocket = require('ws');
//for tcp
const net = require('net');

//http
const http = require('http')  //http模块创建服务器
const fs = require('fs')
const path = require('path')
const url = require('url')

//数据库
/**
 * 结果记录，同时作为注册登记表，key=id，val=结果
 * val有如下值
 * - 0.未抢答
 * - <0.正常，具体值为抢答用时，单位毫秒
 * - >0.犯规，提前抢答的毫秒数
 */
let result = new Array();

/**
 * 选手名称，key=id，val=name
 */
let names = new Array();

/**
 * 抢答状态
 * - 0.未开始，不接受抢答请求，接受注册
 * - 1.开始，倒计时阶段，抢答=犯规，不接受注册
 * - 2.开始，抢答阶段，正常抢答，不接受注册
 * - 3.抢答结束，不接受抢答请求，不接受注册
 * - 4.暂停阶段，不接受抢答请求，不接受注册
 */
let stat = 0;

/**
 * 抢答倒计时时间，默认为3秒，单位毫秒
 */
let t1 = 3000;

/**
 * 抢答时间，默认10秒，单位毫秒
 */
let t2 = 10000;

/**
 * 初始化时钟
 */
const CT_TIME = new Date().getTime();

/**
 * 倒计时阶段结束的时刻
 */
let nt = CT_TIME;

/**
 * 抢答阶段结束时刻
 */
let ne = CT_TIME;

/**
 * 已经进行的时间
 */
let nr = 0;

/**
 * 倒计时定时器
 */
let ni1 = 0;

/**
 * 抢答定时器
 */
let ni2 = 0;

/**
 * msg接口连接池
 */
let client_pool = [];

/**
 * config接口连接池
 */
let cof_pool = [];

/**
 * 字符串转十六进制，空格分开
 * @param {String} str
 * @returns {String}
 */
function stringToHex(str) {
    let val = "";
    for (var i = 0; i < str.length; i++) {
        if (val == "")
            val = str.charCodeAt(i).toString(16);
        else
            //val += " " + str.charCodeAt(i).toString(16);
            val += str.charCodeAt(i).toString(16);
    }
    return val;
}

/**
 * 十六进制转字符串，空格分开
 * @param {String} str
 * @returns {String}
 */
function hexToString(str) {
    let arr = str.split(" ");
    let temp_arr = [], numX;
    for (let i = 0, len = arr.length; i < len; i++) {
        numX = parseInt(arr[i], 16);//10进制；
        temp_arr[i] = String.fromCharCode(numX);
    }
    return temp_arr.join("");
}

/**
 * 数字转十进制字符串，空格分开
 * @param {Number} num
 * @returns {String}
 */
function numToOct(num) {
    return num <= 0xff ?
        num.toString() :
        //numToString(num >> 8) + String.fromCharCode(num & 0xff);
        numToOct(Math.floor(num / 100)) + " " + (num % 100).toString();
}

/**
 * 数字转十进制字符串，空格分开
 * @param {Number} num
 * @returns {String}
 */
function numToHex(num) {
    let ans = (num & 0xff).toString(16);
    while (num >>= 8) {
        ans = (num & 0xff).toString(16) + " " + ans;
    }
    return ans;
}

/**
 * 数字转Buffer，4字节
 * @param {Number} num
 * @returns {Buffer}
 */
function numToBuff(num) {
    if (num === 0)
        return Buffer.from([0]);
    let arr = [];
    while (num) {
        arr.push(num & 0xff);
        num >>= 8;
    }
    return Buffer.from(arr.reverse());
}

/**
 * Buffer转数字
 * @param {Buffer} buff
 */
function buffToNum(buff) {
    buff.reverse();
    return buff.reduce((a, b, idx) => {
        return a + b * Math.pow(0x100, idx);
    })
}

/**
 * Buffer转十六进制字符串
 * @param {Buffer} buff
 */
function buffToHex(buff) {
    let ans = "";
    for (let i = 0; i < buff.length; i++) {
        ans += buff[i].toString(16) + " ";
    }
    return ans;
}

/**
 * 推送结果到/msg
 * @param {Number} user
 */
function wsPush(user = null) {
    const cct = new Date().getTime();

    //迭代
    client_pool = client_pool.filter((a, idx) => {
        try {
            a.send(JSON.stringify({
                stat,
                ct: cct,
                nr,
                //使用nr判断之前的stat
                nt: stat === 1 ? nt :
                    stat === 2 ? ne :
                        stat === 4 ?
                            (nr < t1 ? (cct + t1 - nr) : (cct + t1 + t2 - nr)) :
                            0,
                reg: result.length,
                res: result,
                //抢答的用户
                user
            }));
            return true;
        }
        catch (e) {
            console.log(`[WS_MSG] Sending failed, remove client ${idx}`);
            return false;
        }
    });
}

/**
 * 推送到/config
 */
function wsPush_cof() {
    cof_pool = cof_pool.filter((a, idx) => {
        try {
            a.send(JSON.stringify({
                stat, t1, t2, names
            }));
            return true;
        }
        catch (e) {
            console.log(`[WS_COF] Sending failed, remove client ${idx}`);
            return false;
        }
    })
}

//TCP Sever
const server = net.createServer();

server.on("listening", function () {
    console.log(`[TCP] Server opened`);
});
//客户端抢答逻辑
server.on("connection", function (socket) {
    console.log(`[TCP] Connected from [${socket.remoteAddress}:${socket.remotePort}]`);
    //请求
    socket.on("data", function (data) {
        //接收时钟
        const CT_RECV = new Date().getTime();
        //data的类型为buffer
        const data_str = data.toString();
        const data_hex = buffToHex(data);
        //const data_num = parseInt("0x" + data_hex);
        console.log(`[TCP] Received from [${socket.remoteAddress}:${socket.remotePort}]:[${data_hex}]`);
        //socket.write(numToString(new Date().getTime() - CT_TIME));
        const flag = data_str.substr(0, 1).charCodeAt(0);
        //console.log(flag);
        switch (flag) {
            case 0: {
                //请求当前时钟，响应长度为
                const ans = CT_RECV - CT_TIME;
                //计算ans长度，补0至4字节
                let blen = 1;
                while (ans >> (blen * 8))
                    blen += 1;
                if (blen > 4) {
                    //当前时间过长，应重新启动
                    console.log(`[TCP] Clock too long, exit`);
                    process.exit();
                }
                socket.write(Buffer.concat([
                    Buffer.from(Array(5 - blen).fill(0)),
                    numToBuff(ans)
                ]));
                console.log(`[TCP] Request clock:[${numToHex(ans)}], using ${new Date().getTime() - CT_RECV}ms`)
                break;
            }
            case 1: {
                //请求注册
                //用户数爆满
                if (result.length >= 0xffffffff || stat !== 0) {
                    console.log(`[TCP] Reject registe`);
                    break;
                }
                //允许注册
                result.push(0);
                names.push(null);
                const id = result.length - 1;
                //补0计算
                let blen = 1;
                while (id >> (blen * 8))
                    blen += 1;
                socket.write(Buffer.concat([
                    Buffer.from([1]),
                    Buffer.from(Array(4 - blen).fill(0)),
                    numToBuff(id)
                ]));
                console.log(`[TCP] Request registe:[${id}]`);
                //推送
                wsPush();
                wsPush_cof();
                break;
            }
            case 3: {
                //抢答
                if (data.length !== 9) {
                    console.log(`[TCP] Unknow request`);
                    break;
                }
                //提取数据区
                const id = buffToNum(data.slice(1, 5));
                const time = buffToNum(data.slice(5, 9));
                let time_valid = true;
                if (stat === 0 || stat === 3 || stat === 4 ||
                    result[id] === undefined || result[id] !== 0) {
                    //没注册 || 不允许抢答
                    socket.write(Buffer.from([3, 1]));
                    return;
                }
                console.log(`[TCP] Answer from [${id}] at [${time}]`);
                const t_gap = Math.abs(time - (CT_RECV - CT_TIME));
                if (t_gap > ACC_GAP) {
                    //时间误差过大，此时依然有效，但会以主机时钟为标尺
                    socket.write(Buffer.from([3, 2]));
                    time_valid = false;
                    console.log(`[TCP] T_GAP too large for ${t_gap}`);
                } else
                    socket.write(Buffer.from([3, 0]));

                result[id] = time_valid ?
                    time + CT_TIME - nt ://客户端时钟
                    CT_RECV - nt;//主机时钟
                wsPush(id);
                break;
            }
            default: {
                console.log(`[TCP] Unknow request`)
                break;
            }
        }
    });
    socket.on("end", function () {
        console.log(`[TCP] Closed from [${socket.remoteAddress}:${socket.remotePort}]`);
    });
});
server.on("close", function () {
    console.log(`[TCP] Server closed`);
});
server.on("error", function (err) {
    console.log(`[TCP] Error:${err}`);
})

//TCP监听
server.listen(TCP_PORT);

/**
 * WebSocket Server
 * 推送当前抢答情况和接收控制命令
 */
// 引用Server类:
const WebSocketServer = WebSocket.Server;
// 实例化:
const wss = new WebSocketServer({
    port: WS_PORT
});
wss.on("listening", function () {
    console.log(`[WS] Server opend`);
})
wss.on("error", function (err) {
    console.log(`[WS] Server error:${err}`);
});

//后台操作
wss.on("connection", function (ws, req) {
    console.log(`[WS] Connected from [${req.connection.remoteAddress}:${req.connection.remotePort}],path:[${req.url}]`);
    //消息接口
    if (req.url === "/msg") {
        ws.on("message", function (message) {
            console.log(`[WS] Received from [${ws._socket.remoteAddress}:${req.connection.remotePort}]:${message}`);
        });
        ws.on("close", function () {
            console.log(`[WS_MSG] Closed from [${ws._socket.remoteAddress}:${req.connection.remotePort}]`);
        })
        //加入连接池
        client_pool.push(ws);
        //推送
        wsPush();
    }
    //配置事件接口
    else if (req.url === "/config") {
        ws.on("close", function () {
            console.log(`[WS_COF] Closed from [${ws._socket.remoteAddress}:${req.connection.remotePort}]`);
        });
        //加入连接池
        cof_pool.push(ws);
        //推送
        wsPush_cof();
    } else {
        ws.close();
        console.log(`[WS] Unknow path`);
    }
});

//http服务器
http.createServer(function (request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*')
    console.log(`[HTTP] Request from ${request.connection.remoteAddress}:${request.connection.remotePort} at [${request.url}]`)
    //静态资源，匹配/www
    if (/\/www.*/.test(request.url)) {
        let filePath = request.url.substr(1);
        //检测目录是否存在
        if (!fs.existsSync(filePath)) {
            //响应404
            response.writeHead(404);
            response.end('File not found');
            response.end();
            return;
        }
        //对于目录，添加index.html文件
        if (fs.lstatSync(filePath).isDirectory()) {
            if (/\/$/.test(filePath))
                filePath += 'index.html';
            else
                filePath += '/index.html';
        }
        //检测文件是否存在
        if (!fs.existsSync(filePath)) {
            //响应403，拒绝访问
            response.writeHead(403);
            response.end('File not found');
            response.end();
            return;
        }

        const extname = path.extname(filePath);
        let contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
        }

        fs.readFile(filePath, function (error, content) {
            if (error) {
                if (error.code == 'ENOENT') {
                    fs.readFile('./404.html', function (error, content) {
                        response.writeHead(200, { 'Content-Type': contentType });
                        response.end(content, 'utf-8');
                    });
                } else {
                    response.writeHead(500);
                    response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                    response.end();
                }
            } else {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
        });
    }
    //控制接口
    else if (/^\/ctr\?/.test(request.url)) {
        const cct = new Date().getTime();
        const parm = url.parse(request.url, true).query;
        //response.writeHead(200, {"Content-Type": "application/json"})
        switch (parm.act) {
            case "start": {
                //开始
                if (stat !== 0 && stat !== 3) {
                    //已经开始
                    response.write("1");
                    break;
                }
                //启动抢答程序
                //成绩清除
                result = result.map((a) => a = 0);
                //进入倒计时阶段
                stat = 1;
                //计算nt
                nt = cct + t1;
                //计算ne
                ne = nt + t2;
                //倒计时阶段
                ni1 = setTimeout(function () {
                    //进入下一阶段
                    stat = 2;
                    wsPush();
                    console.log(`[ACT] stat = 2, catching`);
                }, t1);
                //抢答阶段
                ni2 = setTimeout(function () {
                    //进入下一阶段
                    stat = 3;
                    wsPush();
                    console.log(`[ACT] stat = 3, finished`);
                }, t1 + t2);
                //响应
                response.write("0");
                wsPush();
                wsPush_cof();
                console.log(`[HTTP] Request start OK`);
                break;
            }
            case "reset": {
                //重置
                //清除setTimeout任务
                clearTimeout(ni1);
                clearTimeout(ni2);
                //成绩清除
                result = result.map((a) => a = 0);
                //回位
                stat = 0;
                //响应
                response.write("0");
                wsPush();
                wsPush_cof();
                console.log(`[HTTP] Request reset OK`);
                break;
            }
            case "modt": {
                //修改倒计时时间
                if ((stat !== 0 && stat !== 3) ||
                    !/^[1-9]\d*$/.test(parm.val)
                ) {
                    //已经开始，不再允许修改 || 参数不对
                    response.write("1");
                    break;
                }
                t1 = parseInt(parm.val);
                response.write("0");
                wsPush_cof();
                console.log(`[HTTP] Request modify t1 to ${parm.val} OK`);
                break;
            }
            case "modt2": {
                //修改抢答时间
                if ((stat !== 0 && stat !== 3) ||
                    !/^[1-9]\d*$/.test(parm.val)
                ) {
                    //已经开始，不再允许修改 || 参数不对
                    response.write("1");
                    break;
                }
                t2 = parseInt(parm.val);
                response.write("0");
                wsPush_cof();
                console.log(`[HTTP] Request modify t2 to ${parm.val} OK`);
                break;
            }
            case "pause": {
                //暂停
                if (stat !== 1 && stat !== 2) {
                    //未开始
                    response.write("1");
                    break;
                }
                //允许暂停
                clearTimeout(ni1);
                clearTimeout(ni2);
                stat = 4;
                //计算nr，用于恢复倒计时
                nr = stat === 1 ?
                    //1阶段未结束
                    cct - nt + t1 :
                    //1阶段结束，位于2阶段
                    cct - ne + t2 + t1;

                response.write("0");
                wsPush();
                wsPush_cof();
                console.log(`[HTTP] Request pause OK`);
                break;
            }
            case "continue": {
                //恢复
                if (stat !== 4) {
                    //未暂停
                    response.write("1");
                    break;
                }
                if (nr < t1) {
                    //1阶段未结束
                    stat = 1;
                    //恢复nt，nt=当前时间+t1-nr
                    nt = cct + t1 - nr;
                    ne = nt + t2;
                    ni1 = setTimeout(function () {
                        //结束1阶段
                        stat = 2;
                        wsPush();
                        console.log(`[ACT] stat = 2, catching`)
                    }, t1 - nr);
                }
                else {
                    //1阶段结束，恢复到2阶段
                    stat = 2;
                }
                //nt已经完了，计算ne，ne=当前时间+t1+t2-nr
                ne = cct + t1 + t2 - nr;
                ni2 = setTimeout(function () {
                    stat = 3;
                    wsPush();
                    console.log(`[ACT] stat = 3, finished`)
                }, t1 + t2 - nr);
                response.write("0");
                wsPush();
                wsPush_cof();
                console.log(`[HTTP] Request continue OK`);
                break;
            }
            case "get_name": {
                //获取名称
                response.write(JSON.stringify({
                    stat: 0,
                    data: names
                }));
                console.log(`[HTTP] Request get_name OK`);
                break;
            }
            case "name": {
                //设置名称
                if (!/^\d*$/.test(parm.id ||
                    names[parseInt(parm.id)] === undefined ||
                    parm.name === undefined)
                ) {
                    response.write("1");
                    break;
                }
                names[parseInt(parm.id)] = parm.name;
                response.write("0");
                //推送
                wsPush_cof();
                console.log(`[HTTP] Request name [${parm.id}] to [${parm.name} OK]`);
                break;
            }
            case undefined: {
                response.write("1");
                break;
            }
        }
        response.end();
    }
    //未知
    else {
        response.writeHead(500);
        response.end('Sorry, unknow error');
        response.end();
    }

}).listen(HTTP_PORT);
console.log(`[HTTP] Server opened`);
