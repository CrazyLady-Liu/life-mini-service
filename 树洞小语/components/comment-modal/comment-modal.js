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
      if (post && post.id) {
        this.setData({
          processedPost: { ...post }
        })
      }
    },
    'visible': function(visible) {
      if (!visible) {
        this.setData({ inputValue: '' })
      }
    }
  },

  methods: {
    noOp() {},

    formatComment(comment) {
      return {
        ...comment,
        timeText: util.formatTime(comment.timestamp),
        nicknameFirst: comment.nickname ? comment.nickname.charAt(0) : '匿'
      }
    },

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
      if (!content) {
        wx.showToast({
          title: '请输入评论内容',
          icon: 'none'
        })
        return
      }

      const nickname = util.getRandomNickname()
      const newComment = {
        id: util.generateId(),
        content: content,
        nickname: nickname,
        avatarColor: util.getRandomAvatar(),
        timestamp: Date.now(),
        nicknameFirst: nickname.charAt(0),
        timeText: '刚刚'
      }

      storage.addComment(this.data.processedPost.id, newComment)

      const currentComments = this.data.processedPost.comments || []
      const updatedComments = [...currentComments, newComment]
      const commentCount = updatedComments.length

      this.setData({
        inputValue: '',
        'processedPost.comments': updatedComments,
        'processedPost.commentCount': commentCount
      })

      wx.showToast({
        title: '评论成功',
        icon: 'success'
      })

      this.triggerEvent('commented', { 
        postId: this.data.processedPost.id,
        commentCount: commentCount
      })
    }
  }
})
