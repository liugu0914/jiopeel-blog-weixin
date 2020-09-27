Component({
  data: {
    selected: 0,
    color: "#272727",
    selectedColor: "#ffbc00",
    list: [{
      pagePath: "/pages/index/index",
      icon : "cs cs-jiopeel",
      text: "主页"
    }, {
      pagePath: "/pages/message/message",
      icon : "cs cs-pinglun",
      text: "留言"
    }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      console.log(JSON.stringify(data))
      const url = data.path
      wx.switchTab({url})
    }
  }
})