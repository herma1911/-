// 对账单自动生成和消息推送工具

// 对账单自动生成规则
function generateMonthlyReconciliation() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthStr = lastMonth.toISOString().slice(0, 7);
  
  console.log(`开始生成 ${monthStr} 月对账单`);
  
  // 获取所有工人数据
  const workers = uni.getStorageSync('workers') || [];
  
  workers.forEach(worker => {
    // 生成对账单
    const reconciliation = createReconciliation(worker, monthStr);
    
    // 保存对账单
    const reconciliations = uni.getStorageSync('reconciliations') || [];
    reconciliations.push(reconciliation);
    uni.setStorageSync('reconciliations', reconciliations);
    
    // 推送通知给工人
    sendNotification({
      userId: worker.id,
      type: 'reconciliation_generated',
      title: '新对账单待确认',
      content: `${monthStr}月对账单已生成，请查看并确认`,
      icon: '📋'
    });
    
    // 推送通知给班组长
    if (worker.teamLeaderId) {
      sendNotification({
        userId: worker.teamLeaderId,
        type: 'reconciliation_awaiting_approval',
        title: '对账审核提醒',
        content: `${worker.name}的${monthStr}月对账单待审核`,
        icon: '📋'
      });
    }
  });
  
  console.log(`对账单生成完成，共生成 ${workers.length} 份对账单`);
}

// 创建对账单
function createReconciliation(worker, monthStr) {
  // 获取工人的工时和计件数据
  const timeRecords = getWorkerTimeRecords(worker.id, monthStr);
  const pieceworkRecords = getWorkerPieceworkRecords(worker.id, monthStr);
  
  // 计算工资
  let totalTimeWage = 0;
  let totalPieceworkWage = 0;
  
  timeRecords.forEach(record => {
    totalTimeWage += record.amount;
  });
  
  pieceworkRecords.forEach(record => {
    totalPieceworkWage += record.amount;
  });
  
  // 根据用工类型计算总工资
  let totalWage = 0;
  let workType = worker.workType || 1; // 默认纯计件
  
  switch (workType) {
    case 1: // 纯计件
      totalWage = totalPieceworkWage;
      break;
    case 2: // 纯计时
      totalWage = totalTimeWage;
      break;
    case 3: // 混合用工
      totalWage = totalPieceworkWage + totalTimeWage;
      break;
  }
  
  return {
    id: Date.now(),
    workerId: worker.id,
    workerName: worker.name,
    workType: workType,
    month: monthStr,
    applyDate: new Date().toISOString(),
    amount: totalWage,
    pieceworkAmount: totalPieceworkWage,
    hourlyAmount: totalTimeWage,
    status: 'pending',
    transactions: [
      ...timeRecords.map(record => ({
        date: record.date,
        type: 'hourly',
        hours: record.hours,
        amount: record.amount,
        description: record.description
      })),
      ...pieceworkRecords.map(record => ({
        date: record.date,
        type: 'piecework',
        quantity: record.quantity,
        unitPrice: record.unitPrice,
        amount: record.amount,
        description: record.description
      }))
    ]
  };
}

// 获取工人的工时记录
function getWorkerTimeRecords(workerId, monthStr) {
  const records = uni.getStorageSync('workRecords') || [];
  return records.filter(record => 
    record.workerId === workerId &&
    record.type === 'hourly' &&
    record.date.startsWith(monthStr)
  );
}

// 获取工人的计件记录
function getWorkerPieceworkRecords(workerId, monthStr) {
  const records = uni.getStorageSync('workRecords') || [];
  return records.filter(record => 
    record.workerId === workerId &&
    record.type === 'piecework' &&
    record.date.startsWith(monthStr)
  );
}

// 发送通知
function sendNotification(notification) {
  const notifications = uni.getStorageSync('notifications') || [];
  notifications.push({
    id: Date.now(),
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    content: notification.content,
    icon: notification.icon,
    read: false,
    createdAt: new Date().toISOString()
  });
  uni.setStorageSync('notifications', notifications);
  
  // 这里可以添加实际的APP推送逻辑
  console.log(`发送通知给用户 ${notification.userId}: ${notification.title} - ${notification.content}`);
}

// 处理对账单审核通过
function handleReconciliationApproval(reconciliationId) {
  const reconciliations = uni.getStorageSync('reconciliations') || [];
  const reconciliation = reconciliations.find(r => r.id === reconciliationId);
  
  if (reconciliation) {
    reconciliation.status = 'confirmed';
    reconciliation.confirmDate = new Date().toISOString();
    uni.setStorageSync('reconciliations', reconciliations);
    
    // 推送通知给工人
    sendNotification({
      userId: reconciliation.workerId,
      type: 'reconciliation_approved',
      title: '对账审核通过',
      content: `${reconciliation.month}月对账单已审核通过，请确认收款`,
      icon: '✅'
    });
  }
}

// 处理对账单驳回
function handleReconciliationRejection(reconciliationId, reason) {
  const reconciliations = uni.getStorageSync('reconciliations') || [];
  const reconciliation = reconciliations.find(r => r.id === reconciliationId);
  
  if (reconciliation) {
    reconciliation.status = 'rejected';
    reconciliation.rejectionReason = reason;
    reconciliation.rejectDate = new Date().toISOString();
    uni.setStorageSync('reconciliations', reconciliations);
    
    // 推送通知给工人
    sendNotification({
      userId: reconciliation.workerId,
      type: 'reconciliation_rejected',
      title: '对账被驳回',
      content: `${reconciliation.month}月对账单被驳回，原因：${reason}`,
      icon: '❌'
    });
  }
}

// 处理异议
function handleDispute(reconciliationId, resolution) {
  const reconciliations = uni.getStorageSync('reconciliations') || [];
  const reconciliation = reconciliations.find(r => r.id === reconciliationId);
  
  if (reconciliation) {
    reconciliation.status = 'confirmed';
    reconciliation.disputeResolution = resolution;
    reconciliation.resolveDate = new Date().toISOString();
    uni.setStorageSync('reconciliations', reconciliations);
    
    // 推送通知给工人
    sendNotification({
      userId: reconciliation.workerId,
      type: 'dispute_resolved',
      title: '异议处理完成',
      content: `您的异议已处理，结果：${resolution}`,
      icon: '🔧'
    });
  }
}

// 处理工资到账确认
function handleSalaryConfirmation(reconciliationId) {
  const reconciliations = uni.getStorageSync('reconciliations') || [];
  const reconciliation = reconciliations.find(r => r.id === reconciliationId);
  
  if (reconciliation) {
    reconciliation.salaryConfirmed = true;
    reconciliation.salaryConfirmDate = new Date().toISOString();
    uni.setStorageSync('reconciliations', reconciliations);
    
    // 推送通知给班组长
    if (reconciliation.teamLeaderId) {
      sendNotification({
        userId: reconciliation.teamLeaderId,
        type: 'salary_confirmed',
        title: '工资已确认',
        content: `${reconciliation.workerName}已确认收到工资`,
        icon: '💰'
      });
    }
  }
}

// 导出模块
export default {
  generateMonthlyReconciliation,
  createReconciliation,
  handleReconciliationApproval,
  handleReconciliationRejection,
  handleDispute,
  handleSalaryConfirmation,
  sendNotification
};