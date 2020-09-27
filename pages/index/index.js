import api from '../../utils/requset';
import Tool from '../../utils/tool';


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
          selected: 0
        })
      }
    }
  },
  data: {
    items: [],
    height: 100,
    triggered: false,
    userName: '',
    say: '',
    sayUserName: '',
    pages: 0,
    pageNum: 0,
    msg: '加载中...'
  },
  methods: {
    onLoad: function () {
      console.log("onLoad")
      if (gData.sys && gData.sys.windowHeight) {
        this.setData({
          height: gData.sys.windowHeight
        })
      }
      Promise.resolve(this.onRefresh())
    },
    loadData: function (callback) {
      const that = this
      const num = that.data.pageNum
      const pages = that.data.pages
      console.log("num :" + num)
      console.log("pages :" + pages)
      console.log("num===pages :" + (num === pages))
      if (num !== 0 && pages !== 0 && (num === pages)) {
        return that.setData({
          msg: "———— The End ————"
        })
      }
      this.getContents(callback)
    },

    getContents: function (callback) {
      const that = this
      api.request(baseUrl+'/getContentList', 'post', {
        pageNum: that.data.pageNum,
        alias: 'home'
      }).then((base) => {
        let msg = ''
        let flag = true
        let page = null
        if (!base.data || typeof base.data !== 'object') {
          msg = '暂无更多'
          flag = false
        } else if (!(page = base.data) || !Tool.isJSON(page) || !page.result || !Tool.isJSON(page.result) || page.result.length === 0) {
          msg = '———— The End ————'
          flag = false
        }
        const result = page.result
        console.log('result : ' + JSON.stringify(result))
        that.setData({
          pages: flag ? page.pages : that.data.pages,
          msg: msg,
          items: that.data.items.concat(result)
        })
        if (result.length !== 0) {
          that.data.pageNum++
        }
      }).catch((res) => {
        console.log('err : ' + res)
        wx.showToast({
          title: res,
          icon: 'none',
          mask:true,
          duration: 2000
        })
      }).done().finally(() => {
        if (callback && typeof callback === 'function') {
          callback()
        }
        that.offline()
      })
    },
    /**
     * 超时处理
     */
    offline: function () {
      const that = this
      setTimeout(() => {
        if (that.data.items.length === 0 && that.data.msg === '加载中...') {
          that.setData({
            msg: '连接超时'
          })
        }
      }, gData.timeout)
    },
    loadMore: function () {
      console.log('loadMore')
      this.setData({
        msg: '加载中...'
      })
      this.loadData()
    },
    /**
     *  下拉刷新被触发
     */
    onRefresh: function () {
      const that = this
      if (that._freshing) return
      that._freshing = true
      that.setData({
        pages: 0,
        pageNum: 0,
        items: [],
        msg: '加载中...',
        triggered: true
      })
      this.famouSays()
      that.loadData(() => {
        that.setData({
          triggered: false
        })
        that._freshing = false
      })
    },
    famouSays:function(){
      const that = this
      // const arr =[]
      const typeid= Math.floor(Math.random() * (45 - 1 + 1) + 1)
      const says = wx.getStorageSync('says') || []
      api.request('https://v1.alapi.cn/api/mingyan?typeid='+typeid,'get')
      .then((res)=>{
        console.log(res)
        if(res.code !== 200){
          return
        }
        const sayData ={
          say: res.data.content,
          sayUserName: res.data.author
        }
        says.push(sayData)
        wx.setStorageSync('says',says)
        that.setData(sayData)
      }).catch(()=>{
        if(says.length ===0){
          return
        }
        const key =Math.floor(Math.random() * (says.length - 1 ))
        that.setData(says[key])
      })
    },
    openArticle:function(event){
      console.log(event)
      const target = event.currentTarget
      const id = target.id
      wx.navigateTo({
        url: '/pages/article/article',
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          acceptDataFromOpenedPage: function(data) {
            console.log(data)
          },
          someEvent: function(data) {
            console.log(data)
          }
        },
        success: function(res) {
          console.log("打开成功")
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('acceptDataFromOpenerPage', { id:id })
        },
        fail:function(res) {
          console.log("开启失败 ：" + res)
          return wx.showToast({
            title: "页面无效",
            icon: 'none',
            mask: true,
            duration: 2000
          })
        }
      })
    },
    onShow(options) {
      console.log(options)
      console.log('index show')
    }
  }
})