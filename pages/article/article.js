import api from '../../utils/requset';
import Tool from '../../utils/tool';
import WxParse from '../../wxParse/wxParse.js';

//获取应用实例
const app = getApp()
const gData = app.globalData;
const baseUrl = app.baseUrl;

Component({
  data: {
    contentid:'0',
    item: {},
    comments:[],
    love: 0,
    pages:0,
    pageNum:0,
    total : 0,
    msg: '加载中...'
  },
  methods: {
    onLoad: function () {
      console.log("文章 onload")
      const that = this
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
          contentid:data.id
        })
        that.loadContent(data.id)
      })
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
      }).finally(()=>{
        this.onReachBottom()
      })
    },
    /**
     * 文章点赞
     */
    giveLike: function (event) {
      const id =this.data.contentid?this.data.contentid:String(event.currentTarget.id)
      console.log("id :" + id)
      const that = this
      const likes = wx.getStorageSync('likes') || []
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
          wx.setStorageSync('likes', likes)
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
    loadComments:function(){
      const that = this 
      api.requestForm(baseUrl+'/loadComments','post',{
        pageNum: that.data.pageNum,
        style: "content",
        contentid: that.data.contentid
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
          total : page.total,
          pages: flag ? page.pages : that.data.pages,
          msg: msg,
          comments: that.data.comments.concat(result)
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
      }).done()
    }
  }
})