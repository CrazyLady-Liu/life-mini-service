const util = require('../../utils/util.js')
const storage = require('../../utils/storage.js')

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    post: {
      type: Object,
      value: {}
    }
  },

  data: {
    inputValue: '',
    processedPost: {}
  },

  observers: {
    'post': function(post) {
      if (post && post.nickname) {
        const processedPost = {
          ...post,
          nicknameFirst: post.nickname ? post.nickname.charAt(0) : '匿'
        }
        if (processedPost.comments) {
          processedPost.comments = processedPost.comments.map(c => ({
            ...c,
            nicknameFirst: c.nickname ? c.nickname.charAt(0) : '匿'
          }))
        }
        this.setData({ processedPost })
      }
    }
  },

  methods: {
    noOp() {},

    handleClose() {
      this.triggerEvent('close')
    },

    handleInput(e) {
      this.setData({
        inputValue: e.detail.value
      })
    },

    handleSend() {
      const content = this.data.inputValue.trim()
      if (!content) return

      const nickname = util.getRandomNickname()
      const comment = {
        id: util.generateId(),
        content: content,
        nickname: nickname,
        avatarColor: util.getRandomAvatar(),
        timestamp: Date.now(),
        nicknameFirst: nickname.charAt(0)
      }

      const posts = storage.addComment(this.properties.post.id, comment)
      const updatedPost = posts.find(p => p.id === this.properties.post.id)
      
      if (updatedPost) {
        updatedPost.comments.forEach(c => {
          c.timeText = util.formatTime(c.timestamp)
          if (!c.nicknameFirst && c.nickname) {
            c.nicknameFirst = c.nickname.charAt(0)
          }
        })
        this.setData({
          post: updatedPost,
          inputValue: ''
        })
      }

      wx.showToast({
        title: '评论成功',
        icon: 'success'
      })

      this.triggerEvent('commented', { postId: this.properties.post.id })
    }
  }
})
