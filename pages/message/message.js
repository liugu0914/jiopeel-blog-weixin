//message.js
import api from '../../utils/requset';
import Tool from '../../utils/tool';
// const util = require('../../utils/util.js')

//获取应用实例
const app = getApp()
const gbData = app.globalData;
const baseUrl =app.baseUrl;

Component({
  data: {
    items:[],
    msg:'加载中...',
    pageNum:0,
    pages : 0,
    template: {
      title:'评论',
      disabled: true,
      comment: "",
      hasEmoji: "",
      showEmoji: false,
      focus:false,
      class: '',
      chkLoginClass:'',
      emojis: app.emoji
    }
  },
  methods :{
    onLoad: function () {
      console.log("留言 onload")
      this.loadComments();
    },
    onShow:function(){
        if (typeof this.getTabBar === 'function' &&
          this.getTabBar()) {
          this.getTabBar().setData({
            selected: 1
          })
        }
    },
    loadComments:function(callback){
      const that = this 
      api.requestForm(baseUrl+'/loadComments','post',{
        pageNum: that.data.pageNum,
        style: "custom",
        alias: "message"
      }).then((res)=>{
        console.log(res)
        let msg = ''
        let flag = true
        const page =res.data 
        if (!page || !Tool.isJSON(page)) {
          msg = '暂无评论'
          flag = false
        } else if (!page.result || !Tool.isJSON(page.result) || page.result.length === 0) {
          msg = '暂无评论'
          flag = false
        }
        let result =page.result
        result = result.map((item)=>{
          item.comment =app.change2Emoji(item.comment)
          if(!item.replys || item.replys.length===0){
            return item;
          }
          item.replys = item.replys.map((reply)=>{
            reply.comment =app.change2Emoji(reply.comment)
            return reply;
          })
          return item
        })
        that.setData({
          pages: flag ? page.pages : that.data.pages,
          msg: msg,
          items: that.data.items.concat(result)
        })
        if (result.length !== 0) {
          that.data.pageNum++
        }
      }).catch((res) =>{
        console.log(res)
        wx.showToast({
          title: res,
          icon: 'none',
          mask:true,
          duration: 2000
        })
      }).done().finally(() => {
        console.log("finally")
        if (callback && typeof callback === 'function') {
          callback()
        }
        that.offline()
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
    /**
     *  下拉刷新被触发
     */
    onPullDownRefresh: function () {
      console.log("onPullDownRefresh")
      const that = this
      if (that._freshing) return
      that._freshing = true
      that.setData({
        pages: 0,
        pageNum: 0,
        items: [],
        msg:'加载中...'
      })
      that.loadComments(() => {
        wx.stopPullDownRefresh();
        that._freshing = false
      })
    },
        /**
     * 超时处理
     */
    offline: function () {
      setTimeout(() => {
        if (this.data.items.length === 0 && this.data.msg === '加载中...') {
          this.setData({
            msg: '连接超时'
          })
        }
      }, gbData.timeout)
    },
    /**
     * 评论区相关
     * @param {事件} event 
     */
    StopMove: function (event) {
      console.log("StopMove :")
      console.log(event)
      return false
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
        "template.class": "show",
        "template.disabled": true,
        "template.showEmoji": false,
        "template.chkLoginClass":'',
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
        contentid: "0",
        style: "custom",
        alias :"message",
        superid: that.data.template.superid || '0',
        topid: that.data.template.topid || '0'
      }).then(()=>{
        that.closeComment()
        that.setData({
          items:[],
          msg:'加载中...',
          pageNum:0,
          pages : 0
        })
        wx.showToast({
          title: "已发送评论",
          icon: 'success',
          mask: true,
          duration: 2000
        })
        that.onPullDownRefresh()
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

