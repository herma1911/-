<template>
  <view class="team-management-container">
    <view class="header">
      <text class="title">我的班组</text>
    </view>
    
    <view class="team-list">
      <view v-for="team in teams" :key="team.id" class="team-card">
        <view class="team-header">
          <text class="team-name">{{team.name}}</text>
          <text class="member-count">{{team.members.length}} 人</text>
        </view>
        <view class="team-actions">
          <button class="action-btn view-btn" @click="viewTeamMembers(team)">查看成员</button>
          <button class="action-btn reset-btn" @click="resetInviteCode(team)">重置邀请码</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      teams: [
        {
          id: 1,
          name: '裁剪车间',
          inviteCode: '123456',
          members: [
            { id: 1, name: '张三', role: '组长' },
            { id: 2, name: '李四', role: '工人' },
            { id: 3, name: '王五', role: '工人' }
          ]
        },
        {
          id: 2,
          name: '缝纫车间',
          inviteCode: '654321',
          members: [
            { id: 4, name: '赵六', role: '组长' },
            { id: 5, name: '钱七', role: '工人' }
          ]
        }
      ],
      showMembersModal: false,
      selectedTeam: null
    }
  },
  methods: {
    viewTeamMembers(team) {
      this.selectedTeam = team
      this.showMembersModal = true
    },
    closeMembersModal() {
      this.showMembersModal = false
      this.selectedTeam = null
    },
    removeMember(team, member) {
      uni.showModal({
        title: '剔除成员',
        content: '您确定将该成员剔除出本班组？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            const teamIndex = this.teams.findIndex(t => t.id === team.id)
            if (teamIndex >= 0) {
              const memberIndex = this.teams[teamIndex].members.findIndex(m => m.id === member.id)
              if (memberIndex >= 0) {
                this.teams[teamIndex].members.splice(memberIndex, 1)
                uni.showToast({
                  title: '成员已剔除',
                  icon: 'success'
                })
              }
            }
          }
        }
      })
    },
    resetInviteCode(team) {
      uni.showModal({
        title: '重置邀请码',
        content: '确定要重置该班组的邀请码吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            const newCode = Math.floor(100000 + Math.random() * 900000).toString()
            const teamIndex = this.teams.findIndex(t => t.id === team.id)
            if (teamIndex >= 0) {
              this.teams[teamIndex].inviteCode = newCode
              uni.showToast({
                title: '邀请码已重置',
                icon: 'success'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.team-management-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(74, 144, 226, 0.3);
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.team-card {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.team-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.member-count {
  font-size: 20rpx;
  color: #666;
  background-color: #f0f0f0;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.team-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  flex: 1;
  height: 60rpx;
  font-size: 22rpx;
  border-radius: 10rpx;
}

.view-btn {
  background-color: #4A90E2;
  color: #fff;
}

.reset-btn {
  background-color: #faad14;
  color: #fff;
}
</style>