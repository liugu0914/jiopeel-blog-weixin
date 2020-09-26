//添加事件结束
Promise.prototype.finally = function (callback) {
    var Promise = this.constructor;
    return this.then(
        function (value) {
            Promise.resolve(callback()).then(
                function () {
                    return value;
                }
            );
        },
        function (reason) {
            Promise.resolve(callback()).then(
                function () {
                    throw reason;
                }
            );
        }
    );
}
//错误处理
Promise.prototype.done = function (onFullfilled, onRejected) {
  return this.then( onFullfilled, onRejected )
  .catch(function(reaon){
    setTimeout(()=>{ throw reaon},0)
  })
}
const request = (url, method, data) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: url,
            data: data,
            method: method,
            timeout: 10000, // 10s超时
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                if (res.statusCode && res.statusCode == 200) {
                    resolve(res.data); //返回成功提示信息
                } else {
                    reject(res.data.message); //返回错误提示信息
                }
            },
            fail: function (res) {
                reject("网络连接错误"); //返回错误提示信息
            },
            complete: function (res) {
 
            }
        })
    });
}
const requestForm = (url, method, data) => {
  return new Promise((resolve, reject) => {
      wx.request({
          url: url,
          data: data,
          method: method,
          timeout: 10000, // 10s超时
          header: {
              'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          success: function (res) {
              if (res.statusCode && res.statusCode == 200) {
                  resolve(res.data); //返回成功提示信息
              } else {
                  reject(res.data.message); //返回错误提示信息
              }
          },
          fail: function (res) {
              reject("网络连接错误"); //返回错误提示信息
          },
          complete: function (res) {

          }
      })
  });
}
export default {
  request,
  requestForm
};