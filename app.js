import api from './utils/requset';
//app.js
App({
  // 小程序启动之后 触发
  onLaunch: function () {
    console.log('App Launch')
    this.getUserInfo()
  },
  onShow() {
    console.log('App Show')
    //启动1s后 检测是否开启评论功能
    setTimeout(() => {
      api.request(this.wxUrl + "/commentAble", "get")
        .then((res) => {
          console.log("isOpen")
          if (res.status !== 200 || !res.data)
            return
          const isOpen = res.data.isOpen
          console.log(isOpen)
          this.globalData.isOpen = isOpen === '1' ? true : false
        }).done()
    }, 500)
    //3s后 发送浏览器信息
    setTimeout(() => {
      console.log("UserAgent")
      api.request(this.baseUrl + "/UserAgent", "get").done()
    }, 3000)
  },
  scope: {
    user: 'scope.userInfo'
  },
  getUserInfo: function () {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting[this.scope.user]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          console.log('用户已经授权')
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  LoginSignIn: function (that, event) {
    console.log("LoginSignIn")
    console.log(event)
    const userInfo = event.detail.userInfo
    const gData = this.globalData
    //拒绝
    if (!userInfo) {
      return;
    }
    gData.userInfo = userInfo
    if (gData.userSecret) {
      console.log("userSecret => out")
      return
    }
    this.login(that, function () {
      return wx.showToast({
        title: "登录成功",
        icon: 'success',
        mask: true,
        duration: 2000
      })
    })
  },
  LoginOut: function (that, event) {
    console.log("LoginOut")
    console.log(event)
    const gData = this.globalData
    //拒绝
    gData.userInfo = null
    gData.userSecret = null
    that.setData({
      hasLogin: false
    })
    return wx.showToast({
      title: "已退出登录",
      icon: 'success',
      mask: true,
      duration: 2000
    })
  },
  login: function (that, callback) {
    const gData = this.globalData
    const wxUrl = this.wxUrl
    wx.showLoading({
      title: '登录中...',
    })
    console.log(gData.userInfo)
    // 开始登录操作
    wx.login({
      success: res => {
        console.log(res.code)
        const code = res.code
        if (!code)
          return;
        api.request(wxUrl + `/wxLogin`, "post", {
            code: code,
            ...gData.userInfo
          })
          .then((res) => {
            console.log(res)
            if (res.status !== 200)
              return
            gData.userSecret = res.data
            that.setData({
              hasLogin: true
            })
            if (callback) callback()
          }).catch((res) => {
            console.log(res)
            wx.hideLoading()
            return wx.showToast({
              title: res.message,
              icon: 'none',
              mask: true,
              duration: 2000
            })
          }).finally(() => {
            wx.hideLoading()
          })
      }
    })
  },
  onHide() {
    console.log('App hide')
  },
  onError(msg) {
    console.log(msg)
  },
  change2Emoji: function contentHandle(text) {
    const that = this
    const imgUrl = "https://img.zhikezhui.com/emoji/"
    text = text.replace(/</g, '&lt;').replace(/</g, '&gt;').replace(/\[[A-Z~\u4e00-\u9fa5]+\]/gi, function (str) {
      for (var i = 0; i < that.emoji.length; i++) {
        var item = that.emoji[i];

        if (str === "[" + item.name + "]") {
          return "<img class=\"w-20 emoji\" src=\"" + imgUrl + item.id + ".png\" />";
        }
      }
      return str;
    });
    return text;
  },
  globalData: {
    timeout: 5000,
    sys: wx.getSystemInfoSync()
  },
  baseUrl: 'https://admin.zhikezhui.com/api-nta/blog',
  wxUrl: 'https://admin.zhikezhui.com/api-nta/wx',
  upUrl: 'https://up.zhikezhui.com',
  emoji: [{
    "id": "yiwen",
    "name": "疑问"
  }, {
    "id": "yun",
    "name": "晕"
  }, {
    "id": "liubixie",
    "name": "流鼻血"
  }, {
    "id": "shimo",
    "name": "什么"
  }, {
    "id": "dianzan",
    "name": "点赞"
  }, {
    "id": "biti",
    "name": "鼻涕"
  }, {
    "id": "fendou",
    "name": "奋斗"
  }, {
    "id": "huqi",
    "name": "呼气"
  }, {
    "id": "heng",
    "name": "哼"
  }, {
    "id": "kulou",
    "name": "骷髅"
  }, {
    "id": "leng",
    "name": "冷"
  }, {
    "id": "taoyan1",
    "name": "讨厌"
  }, {
    "id": "shuixing",
    "name": "睡醒"
  }, {
    "id": "aini",
    "name": "爱你"
  }, {
    "id": "aixin1",
    "name": "爱心"
  }, {
    "id": "zhadan",
    "name": "炸弹"
  }, {
    "id": "xinsui",
    "name": "心碎"
  }, {
    "id": "maren",
    "name": "骂人"
  }, {
    "id": "zhutou",
    "name": "猪头"
  }, {
    "id": "qie",
    "name": "企鹅"
  }, {
    "id": "youling",
    "name": "幽灵"
  }, {
    "id": "a",
    "name": "啊"
  }, {
    "id": "bizui",
    "name": "闭嘴"
  }, {
    "id": "baiyan",
    "name": "白眼"
  }, {
    "id": "aixin",
    "name": "爱心"
  }, {
    "id": "dajing",
    "name": "大惊"
  }, {
    "id": "ziya",
    "name": "呲牙"
  }, {
    "id": "daxiao",
    "name": "大笑"
  }, {
    "id": "esi",
    "name": "饿死"
  }, {
    "id": "fadai",
    "name": "发呆"
  }, {
    "id": "fankun",
    "name": "犯困"
  }, {
    "id": "ganga",
    "name": "尴尬"
  }, {
    "id": "fennu",
    "name": "愤怒"
  }, {
    "id": "hanyan",
    "name": "汗颜"
  }, {
    "id": "jingkong",
    "name": "惊恐"
  }, {
    "id": "haochi",
    "name": "好吃"
  }, {
    "id": "emo",
    "name": "恶魔"
  }, {
    "id": "jingsong",
    "name": "惊悚"
  }, {
    "id": "jingya",
    "name": "惊讶"
  }, {
    "id": "kaixin",
    "name": "开心"
  }, {
    "id": "lengku",
    "name": "冷酷"
  }, {
    "id": "danao",
    "name": "大闹"
  }, {
    "id": "liukoushui",
    "name": "流口水"
  }, {
    "id": "liulei",
    "name": "流泪"
  }, {
    "id": "mengbi",
    "name": "懵逼"
  }, {
    "id": "mianwubiaoqing",
    "name": "面无表情"
  }, {
    "id": "nanguo",
    "name": "难过"
  }, {
    "id": "shuizhuo",
    "name": "睡着"
  }, {
    "id": "taoyan",
    "name": "讨厌"
  }, {
    "id": "tanchi",
    "name": "贪吃"
  }, {
    "id": "siliao",
    "name": "死了"
  }, {
    "id": "tiaopi",
    "name": "调皮"
  }, {
    "id": "xiaochulei",
    "name": "笑出泪"
  }, {
    "id": "wuliao",
    "name": "无聊"
  }, {
    "id": "xingxingyan",
    "name": "星星眼"
  }, {
    "id": "xieyan",
    "name": "斜眼"
  }, {
    "id": "xiasi",
    "name": "吓死"
  }, {
    "id": "xiaolian",
    "name": "笑脸"
  }, {
    "id": "ku",
    "name": "酷"
  }, {
    "id": "shengqi",
    "name": "生气"
  }, {
    "id": "yousiliao",
    "name": "又死了"
  }, {
    "id": "en",
    "name": "恩~"
  }, {
    "id": "bushufu",
    "name": "不舒服"
  }, {
    "id": "bianbian",
    "name": "便便"
  }, {
    "id": "fankun1",
    "name": "犯困"
  }, {
    "id": "feiwen",
    "name": "飞吻"
  }, {
    "id": "ganmao",
    "name": "感冒"
  }, {
    "id": "huaixiao",
    "name": "坏笑"
  }, {
    "id": "liuhan",
    "name": "流汗"
  }, {
    "id": "outu",
    "name": "呕吐"
  }, {
    "id": "keshui",
    "name": "瞌睡"
  }, {
    "id": "renzhe",
    "name": "忍者"
  }, {
    "id": "santiaoxian",
    "name": "三条线"
  }, {
    "id": "guaiwu",
    "name": "怪物"
  }, {
    "id": "shoushang",
    "name": "受伤"
  }, {
    "id": "tianshi",
    "name": "天使"
  }, {
    "id": "shuai",
    "name": "衰"
  }, {
    "id": "xianwen",
    "name": "献吻"
  }, {
    "id": "xiaodiaodaya",
    "name": "笑掉大牙"
  }, {
    "id": "xiong",
    "name": "凶"
  }]
})