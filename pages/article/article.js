import api from '../../utils/requset';
import Tool from '../../utils/tool';
import WxParse from '../../wxParse/wxParse.js';

//获取应用实例
const app = getApp()
const baseUrl = app.baseUrl;
const gbData = app.globalData;
Component({
  data: {
    contentid: '0',
    item: {},
    comments: [],
    love: 0,
    pages: 0,
    pageNum: 0,
    total: 0,
    msg: '加载中...',
    isOpen:false,
    template: {
      chkLoginClass:'',
      title:'评论',
      disabled: true,
      comment: "",
      hasEmoji: "",
      showEmoji: false,
      focus:false,
      class: '',
      emojis: app.emoji
    }
  },
  methods: {
    onLoad: function () {
      console.log("文章 onload")
      const that = this
      that.setData({
        isOpen :gbData.isOpen
      })
      const eventChannel = that.getOpenerEventChannel()
      // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
      eventChannel.on('acceptDataFromOpenerPage', function (data) {
        console.log(data)
        if (!data || !Tool.isJSON(data) || !data.id) {
          return wx.showToast({
            title: "页面无效",
            icon: 'none',
            mask: true,
            duration: 2000
          })
        }
        that.setData({
          contentid: data.id
        })
        that.loadContent(data.id)
      })
      
    },
    onReady: function() {
      console.log("页面首次渲染完毕时执行")
      const that = this
      //1s后 发送页面查看计数
      setTimeout(() => {
        console.log("阅读计数")
        api.request(baseUrl + "/AddLook", "get",{id:that.data.contentid}).done()
      }, 1000)
    },
    /**
     * 加载文章
     */
    loadContent: function (id) {
      api.request(baseUrl + "/getContent", "get", {
        contentId: id
      }).then((res) => {
        console.log(res)
        if (res.status !== 200) {
          return wx.showToast({
            title: "页面加载失败",
            icon: 'none',
            mask: true,
            duration: 2000
          })
        }
        const item = res.data
        // item.content=Tool.wxHtmlAble(item.content)
        this.setData({
          item: item,
          love: item.love
        })
        WxParse.wxParse('article', 'html', item.content, this, 5);
      }).catch((msg) => {
        if (!msg) {
          return
        }
        wx.showToast({
          title: msg,
          icon: 'none',
          mask: true,
          duration: 2000
        })
      }).finally(() => {
        this.onReachBottom()
      })
    },
    /**
     * 文章点赞
     */
    giveLike: function (event) {
      const key = "ContentLikes"
      const id = String(event.currentTarget.id)
      console.log("id :" + id)
      const that = this
      const likes = wx.getStorageSync(key) || []
      if (likes.indexOf(id) > -1) {
        return wx.showToast({
          title: "你已经点过赞了",
          icon: 'none',
          duration: 2000
        })
      }
      api.requestForm(baseUrl + "/ContentLike", "post", {
          id: id
        })
        .then((base) => {
          if (base.status !== 200) {
            return wx.showToast({
              title: "页面加载失败",
              icon: 'none',
              duration: 2000
            })
          }
          that.setData({
            love: base.data.love
          })
          likes.push(id)
          wx.setStorageSync(key, likes)
        }).catch((msg) => {
          if (!msg) {
            return
          }
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
        })
    },

    /**
     *  上拉加载被触发
     */
    onReachBottom: function () {
      console.log('onReachBottom')
      const num = this.data.pageNum
      const pages = this.data.pages
      console.log("num :" + num)
      console.log("pages :" + pages)
      console.log("num===pages :" + (num === pages))
      if (num !== 0 && pages !== 0 && (num === pages)) {
        return this.setData({
          msg: "———— The End ————"
        })
      }
      this.loadComments()
    },
    loadComments: function () {
      const that = this
      api.requestForm(baseUrl + '/loadComments', 'post', {
        pageNum: that.data.pageNum,
        style: "content",
        contentid: that.data.contentid
      }).then((res) => {
        console.log(res)
        let msg = ''
        let flag = true
        const page = res.data
        if (!page || !Tool.isJSON(page)) {
          msg = '暂无评论'
          flag = false
        } else if (!page.result || !Tool.isJSON(page.result) || page.result.length === 0) {
          msg = '暂无评论'
          flag = false
        }
        let result = page.result
        result = result.map((item) => {
          item.comment = app.change2Emoji(item.comment)
          if (!item.replys || item.replys.length === 0) {
            return item;
          }
          item.replys = item.replys.map((reply) => {
            reply.comment = app.change2Emoji(reply.comment)
            return reply;
          })
          return item
        })
        that.setData({
          total: page.total,
          pages: flag ? page.pages : that.data.pages,
          msg: msg,
          comments: that.data.comments.concat(result)
        })
        if (result.length !== 0) {
          that.data.pageNum++
        }
      }).catch((res) => {
        console.log(res)
        wx.showToast({
          title: res,
          icon: 'none',
          mask: true,
          duration: 2000
        })
      }).done()
    },
    giveCommentLike: function (event) {
      const key = "CommentLikes"
      const data = event.currentTarget.dataset
      console.log("data :" + JSON.stringify(data))
      const id = String(data.id)
      const that = this
      const likes = wx.getStorageSync(key) || []
      if (likes.indexOf(id) > -1) {
        return wx.showToast({
          title: "你已经点过赞了",
          icon: 'none',
          duration: 2000
        })
      }
      api.requestForm(baseUrl + "/CommentLike", "post", {
          id: id
        })
        .then((base) => {
          if (base.status !== 200) {
            return wx.showToast({
              title: "页面加载失败",
              icon: 'none',
              duration: 2000
            })
          }
          const reply = data.replyindex || data.replyindex === 0 ? `.replys[${data.replyindex}]` : ''
          const changeComments = `comments[${data.index}]${reply}.love`
          that.setData({
            [changeComments]: base.data.love
          })
          likes.push(id)
          wx.setStorageSync(key, likes)
        }).catch((msg) => {
          if (!msg) {
            return
          }
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
        })
    },
    StopMove: function (event) {
      console.log("StopMove :")
      console.log(event)
      return false
    },
    StartMove: function (event) {
      console.log("StartMove :")
      console.log(event)
      return true
    },
    openComment: function (event) {
      console.log("openComment")
      console.log(event)
      if(!gbData.userSecret){
        return this.setData({
          "template.chkLoginClass":'show'
        })
      }
      const data =event.currentTarget.dataset
      this.setData({
        "template.chkLoginClass":'',
        "template.class": "show",
        "template.disabled": true,
        "template.showEmoji": false,
        "template.hasEmoji": "",
        "template.comment":'',
        "template.title": data.title?`回复:${data.title}`:'评论',
        "template.superid": data.superid || '0',
        "template.topid": data.topid || '0'
      })
      console.log(this.data.template)
    },
    closeComment: function () {
      console.log("closeComment")
      this.setData({
        "template.class": ""
      })
    },
    inputChange: function (event) {
      console.log(event)
      let value = event.detail.value
      if (value)
        value = value.replace(/\n\r/g, '')
      this.setData({
        "template.disabled": !(value && value.trim() &&value.length > 0),
        "template.comment": value
      })
    },
    showEmoji: function (event) {
      this.setData({
        "template.hasEmoji": !this.data.template.showEmoji ? "has-emoji" : "",
        "template.showEmoji": !this.data.template.showEmoji
      })
    },
    sendEmoji: function (event) {
      console.log("sendEmoji")
      console.log(event)
      const data = event.currentTarget.dataset
      const comment =this.data.template.comment
      const text =(comment?comment:'') +(data.name ? `[${data.name}]` : '')
      this.setData({
        "template.disabled": !text,
        "template.comment": text,
      })
    },
    sendComment: function (event) {
      console.log("sendComment")
      console.log(this.data.template)
      const that = this
      wx.showLoading({
        title: '评论发射中...',
      })
      api.request(baseUrl+"/saveComments","post",{
        comment: that.data.template.comment,
        contact: "weixin",
        author: gbData.userInfo.nickName,
        userid : gbData.userSecret.userid,
        imgurl : gbData.userInfo.avatarUrl,
        contentid: that.data.contentid,
        style: "content",
        superid: that.data.template.superid || '0',
        topid: that.data.template.topid || '0'
      }).then(()=>{
        that.closeComment()
        that.setData({
          comments: [],
          pages: 0,
          pageNum: 0,
          total: 0,
          msg: '加载中...'
        })
        that.onReachBottom()
        wx.showToast({
          title: "已发送评论",
          icon: 'success',
          mask: true,
          duration: 2000
        })
      }).catch((msg)=>{
        wx.hideLoading()
        return wx.showToast({
          title: msg,
          icon: 'none',
          mask: true,
          duration: 2000
        })
      }).finally(()=>{
        wx.hideLoading()
      })
    },
    /**
     * 登录
     */
    LoginSignIn: function (event) {
      app.LoginSignIn(this,event)
      return this.setData({
        "template.chkLoginClass":''
      })
    },
    /**
     * 取消登录
     */
    CancelLoginSignIn: function () {
      return this.setData({
        "template.chkLoginClass":''
      })
    }
  }
})