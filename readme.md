# qzx-mock-rest-server

> 这是一个简单的服务器，基于EXPRESS，主要是提供了便捷的服务器的建立，这里主要在开发前端代码的时候需要模拟请求的时候使用，并不能正式的作为服务其使用。

## 解决的问题

在开发的过程中经常需要各种各样的REST请求，在开发前端代码的时候，往往为了前后端分离需要自己写REST接口。但是，那样比较麻烦，这里就是为了简便，将REST对应到相应的文件，当请求过来后，会寻找对应的文件，并执行。

### 文件寻找的规则

```bash
/a/b/c
```
如上，如果有一个这样的请求，则请求的规则是：
1. 查看有没有 `a-b-c.js`,如果有，加载、执行
2. 如果没有 向下递推，`a-b.js` 同时将c以参数的形式传递给处理函数，也就是说，假如`a-b.js`存在，那么，将会加载`a-b.js`。

**a-b.js的形式**

```javascript
module.exports = function(req,res,next,data){

};
```
这里的参数和`expres`的参数几乎一致，但是，这里多了一个`data`，就是上面的`c`，最终的参数是: `['c']`

## 安装

```bash
npm install qzx-mock-rest-server --save-dev
```

## 使用

```javascript
const mockServer = require("qzx-mock-rest-server");
let server = new mockServer(port, host, staticDirectory, serverRoot);
```

### 参数默认值
* **port**  端口号，默认是`8080`
* **host**  host,默认是`localhost`
* **staticDirectory** 静态目录，默认是`./static`
* **serverRoot**  `rest`接口的监听目录，默认是`./server`

## 使用已有的express实例

有的时候，需要使用已存在的服务器，比如webpack-dev-server,他也是基于express，这时，可以直接使用其express实例去指定需要监听的rest接口的目录。

```javascript
onst mockServer = require("qzx-mock-rest-server");
...
mockServer.handleMockServer(app,"./server");
// app 由上下文传递过来，./server指明了需要监听的目录
```