// 服装旺季高薪智能推荐系统

// 全国服装产业带淡旺季&工价数据库
const industryBeltData = {
  // 按月份分类的旺季数据
  seasonalData: {
    '1-2': {
      regions: ['广东广州', '广东中山', '广东东莞', '福建泉州', '福建石狮'],
      categories: ['春装T恤', '针织衫', '休闲裤', '开春电商款'],
      keySkills: ['平车', '拷边', '四针六线', '锁眼钉扣', '整烫'],
      pricePremium: '10%-20%',
      description: '开春电商备货旺季，珠三角/闽南全年最稳的开春档期，订单充足'
    },
    '3-4': {
      regions: ['浙江杭州', '浙江嘉兴', '广东广州', '湖北武汉'],
      categories: ['夏装女装', '连衣裙', 'T恤', '防晒衣', '汉服'],
      keySkills: ['平车', '拷边', '冚袖口下摆', '装拉链', '锁眼钉扣'],
      pricePremium: '15%-25%',
      description: '电商夏装备货高峰，杭州女装、广州十三行旺季，熟练工缺口极大'
    },
    '5-6': {
      regions: ['福建泉州', '福建石狮', '广东中山', '江西于都'],
      categories: ['泳装', '沙滩裤', '短袖', '校服', '秋冬外贸订单'],
      keySkills: ['平车', '拷边', '四针六线', '整烫', '裁剪'],
      pricePremium: '10%-20%',
      description: '泳装/校服生产旺季，福建/江西外贸订单集中交付期，工价稳定'
    },
    '7-8': {
      regions: ['江苏常熟', '江苏苏州', '浙江杭州', '浙江宁波', '湖北武汉', '辽宁大连'],
      categories: ['羽绒服', '棉服', '秋冬大衣', '皮草', '外贸冬装'],
      keySkills: ['平车', '充绒', '锁眼钉扣', '整烫', '装拉链', '开口袋'],
      pricePremium: '30%-50%',
      description: '全年羽绒服/冬装第一波备货高峰，工价溢价全年最高，极度缺熟练工'
    },
    '9-10': {
      regions: ['广东广州', '广东中山', '浙江嘉兴', '河南郑州', '四川成都'],
      categories: ['牛仔', '秋冬女裤', '卫衣', '加绒款', '冬装补单'],
      keySkills: ['平车', '拷边', '开口袋', '装拉链', '四针六线'],
      pricePremium: '20%-30%',
      description: '秋冬电商补单+线下门店备货旺季，牛仔/女裤品类进入全年高峰'
    },
    '11-12': {
      regions: ['江苏苏州', '浙江杭州', '山东青岛', '辽宁大连'],
      categories: ['羽绒服收尾', '过年新衣', '外贸春装提前单', '工装'],
      keySkills: ['平车', '整烫', '后道包装', '锁眼钉扣', '样衣工'],
      pricePremium: '20%-40%',
      description: '冬装收尾爆单+过年新衣备货，春节前最后一波高薪档期，工价随工期暴涨'
    }
  },
  // 全年稳岗产业带（保底推荐）
  stableBelts: [
    {
      regions: ['广东广州', '广东东莞', '广东中山'],
      categories: ['牛仔', '针织T恤', '电商快反订单'],
      description: '全年有活，工价稳定'
    },
    {
      regions: ['山东青岛', '山东烟台'],
      categories: ['日韩外贸服装订单'],
      description: '全年订单稳定，对熟练工需求常年存在'
    },
    {
      regions: ['江西于都', '江西南昌'],
      categories: ['针织', '童装', '国内品牌代加工'],
      description: '淡旺季波动小，包吃住福利完善'
    }
  ]
};

// 用户分层权限配置
const userLevelConfig = {
  free: {
    regionLimit: '本省/当前所在市',
    maxRecommendations: 10,
    viewLimit: '基础旺季时间、工价区间'
  },
  active: {
    regionLimit: '周边3个省份',
    maxRecommendations: 30,
    viewLimit: '完整产业带旺季地图 + 工厂发薪信用记录'
  },
  vip: {
    regionLimit: '全国',
    maxRecommendations: 999,
    viewLimit: '全国完整旺季地图 + 全年工价走势预测 + VIP专属岗位池'
  }
};

// 获取当前月份的旺季信息
function getCurrentSeasonInfo() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const monthKey = `${Math.floor((month - 1) / 2) * 2 + 1}-${Math.floor((month - 1) / 2) * 2 + 2}`;
  return industryBeltData.seasonalData[monthKey] || null;
}

// 获取未来1-2个月的旺季预告
function getUpcomingSeasonInfo() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const nextMonthKey = `${Math.floor((month) / 2) * 2 + 1}-${Math.floor((month) / 2) * 2 + 2}`;
  const nextNextMonthKey = `${Math.floor((month + 1) / 2) * 2 + 1}-${Math.floor((month + 1) / 2) * 2 + 2}`;
  
  return {
    next: industryBeltData.seasonalData[nextMonthKey] || null,
    nextNext: industryBeltData.seasonalData[nextNextMonthKey] || null
  };
}

// 智能推荐核心算法
function generateRecommendations(userProfile, userLevel = 'free') {
  const currentSeason = getCurrentSeasonInfo();
  const upcomingSeasons = getUpcomingSeasonInfo();
  const recommendations = [];
  
  // 1. 时间优先：当前旺季推荐
  if (currentSeason) {
    currentSeason.regions.forEach(region => {
      currentSeason.categories.forEach(category => {
        // 2. 技能精准匹配
        const matchedSkills = currentSeason.keySkills.filter(skill => 
          userProfile.skills && userProfile.skills.includes(skill)
        );
        
        if (matchedSkills.length > 0) {
          // 3. 信用保底筛选（模拟）
          const factoryCreditScore = Math.floor(Math.random() * 20) + 80; // 80-100分
          
          if (factoryCreditScore >= 85) {
            // 4. 工价从高到低排序
            const baseSalary = 6000 + Math.random() * 4000; // 6000-10000
            const premiumRate = parseFloat(currentSeason.pricePremium.split('-')[1]) / 100;
            const finalSalary = baseSalary * (1 + premiumRate);
            
            recommendations.push({
              id: `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              region,
              category,
              skills: matchedSkills,
              salary: `${Math.floor(finalSalary / 100) * 100}元/月`,
              pricePremium: currentSeason.pricePremium,
              factoryCreditScore,
              isCurrentSeason: true,
              description: currentSeason.description
            });
          }
        }
      });
    });
  }
  
  // 5. 未来旺季预告
  if (upcomingSeasons.next) {
    upcomingSeasons.next.regions.forEach(region => {
      upcomingSeasons.next.categories.forEach(category => {
        const matchedSkills = upcomingSeasons.next.keySkills.filter(skill => 
          userProfile.skills && userProfile.skills.includes(skill)
        );
        
        if (matchedSkills.length > 0) {
          recommendations.push({
            id: `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            region,
            category,
            skills: matchedSkills,
            salary: '预计8000-12000元/月',
            pricePremium: upcomingSeasons.next.pricePremium,
            factoryCreditScore: 90,
            isUpcoming: true,
            description: upcomingSeasons.next.description
          });
        }
      });
    });
  }
  
  // 6. 个性化优化：根据用户意向地区调整权重
  if (userProfile.intendedRegions && userProfile.intendedRegions.length > 0) {
    recommendations.sort((a, b) => {
      const aMatch = userProfile.intendedRegions.includes(a.region) ? 1 : 0;
      const bMatch = userProfile.intendedRegions.includes(b.region) ? 1 : 0;
      return bMatch - aMatch;
    });
  }
  
  // 7. 工价从高到低排序
  recommendations.sort((a, b) => {
    const salaryA = parseFloat(a.salary.replace('元/月', ''));
    const salaryB = parseFloat(b.salary.replace('元/月', ''));
    return salaryB - salaryA;
  });
  
  // 8. 根据用户等级限制推荐数量
  const maxRecommendations = userLevelConfig[userLevel].maxRecommendations;
  return recommendations.slice(0, maxRecommendations);
}

// 生成全年跑单最优路线（VIP专属）
function generateAnnualRoute(userProfile) {
  const route = [];
  const months = ['1-2', '3-4', '5-6', '7-8', '9-10', '11-12'];
  
  months.forEach(monthKey => {
    const seasonData = industryBeltData.seasonalData[monthKey];
    if (seasonData) {
      // 找到匹配用户技能的地区
      const matchedRegions = seasonData.regions.filter(region => {
        return seasonData.keySkills.some(skill => 
          userProfile.skills && userProfile.skills.includes(skill)
        );
      });
      
      if (matchedRegions.length > 0) {
        const selectedRegion = matchedRegions[0];
        const matchedSkills = seasonData.keySkills.filter(skill => 
          userProfile.skills && userProfile.skills.includes(skill)
        );
        
        route.push({
          period: monthKey + '月',
          region: selectedRegion,
          category: seasonData.categories[0],
          skills: matchedSkills,
          pricePremium: seasonData.pricePremium,
          estimatedIncome: `${Math.floor(8000 + Math.random() * 4000)}元/月`,
          description: seasonData.description
        });
      }
    }
  });
  
  return route;
}

// 检查用户是否有VIP权限
function checkVipPermission(userProfile) {
  return userProfile.userLevel === 'vip';
}

// 导出推荐系统API
export default {
  // 数据
  industryBeltData,
  userLevelConfig,
  
  // 核心方法
  getCurrentSeasonInfo,
  getUpcomingSeasonInfo,
  generateRecommendations,
  generateAnnualRoute,
  checkVipPermission,
  
  // 辅助方法
  getSeasonDataByMonth: (month) => {
    const monthKey = `${Math.floor((month - 1) / 2) * 2 + 1}-${Math.floor((month - 1) / 2) * 2 + 2}`;
    return industryBeltData.seasonalData[monthKey] || null;
  },
  
  getStableBelts: () => industryBeltData.stableBelts
};
