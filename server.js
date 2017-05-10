var console = require("Console");
var $path = require("path");
var fs = require("fs");
var config = {
    home: "./server"
};
module.exports = function(app, root) {
    config.home = root;
    console.stress(`请求处理目录是${root}`);
    // 先查看root目录下是否有$main.js
    let _$mainPath = $path.join(root, "./$main.js");
    if (pathExists(_$mainPath)) {
        console.stress(`存在$main.js处理文件，文件路径是${_$mainPath}`)
            // 存在处理
        require.cache.hasOwnProperty(_$mainPath) && (delete require.cache[_$mainPath]);
        let handler = require(_$mainPath);
        handler(app);
    } else {
        console.stress(`${_$mainPath}目录下没有$main.js处理文件`)
    }
    app.use(function(req, res, next) {
        res.charset = 'utf-8';
        try {
            // 获得请求的方法
            var method = req.method.toLowerCase();
            // 找到请求的处理文件
            var handlerPath = getHandlerPath(req);
            if (handlerPath) {
                // 存在这样的路径的话就进行处理
                // 删除缓存，保证有改动就能够展示，而不需要重启服务器
                delete require.cache[handlerPath.path];
                var handler = require(handlerPath.path);
                // 处理请求 比如请求是 /a/b/c/d 可是只找到了a.js 那么就得把 [b,c,d]传递给处理函数去处理
                handler(req, res, next, handlerPath.params.reverse());
            } else {
                next();
            }
        } catch (e) {
            console.error(e);
            next();
        }
    })
};

// 获得能够处理请求的路径
function getHandlerPath(req) {
    var path = req.path;
    var dir = config.home;
    // a/b/c 映射到a-b-c.js a-b.js a.js
    var arr = path.slice(1).split("/");
    var params = [];
    var tempP;
    while (arr.length > 0) {
        try {
            tempP = $path.join(dir, arr.join("-") + '.js');
            var state = fs.statSync(tempP);
            if (state) {
                // 存在
                break;
            }
        } catch (e) {
            // 不存在
            params.push(arr.pop());
        }
    }
    if (arr.length > 0) {
        console.debug(`${req.url}  有对应的处理文件:`, tempP, `剩余参数: ${params}`);
        return {
            params: params,
            path: tempP
        }
    } else {
        return null;
    }
}

function pathExists(path) {
    let me = this;
    try {
        let state = fs.statSync(path);
        return !!state;
    } catch (e) {
        return false;
    }
}