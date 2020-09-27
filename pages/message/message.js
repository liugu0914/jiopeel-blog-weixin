//message.js
import api from '../../utils/requset';
import Tool from '../../utils/tool';
// const util = require('../../utils/util.js')

//获取应用实例
const app = getApp()
const gData = app.globalData;
const baseUrl =app.baseUrl;

Component({
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 1
        })
      }
    }
  },
  data: {
    items:[],
    triggered:false,
    msg:'加载中...',
    pageNum:0,
    pages : 0
  },
  methods :{
    onLoad: function () {
      console.log("留言 onload")
      this.loadComments();
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
      }, gData.timeout)
    }
  }
})

