// 服装全品类工序工时标准表数据库管理工具

// 数据库表结构：garment_process_standard
// 字段：process_id, garment_category, sub_category, process_name, machine_type, standard_time, difficulty_coefficient, base_price, process_desc, fabric_type, fabric_category

// 面料大分类数据
const fabricCategories = [
  { id: 'F001', name: '牛仔布' },
  { id: 'F002', name: '棉布' },
  { id: 'F003', name: '麻布' },
  { id: 'F004', name: '丝绸' },
  { id: 'F005', name: '化纤' },
  { id: 'F006', name: '混纺' },
  { id: 'F007', name: '针织布' },
  { id: 'F008', name: '梭织布' },
  { id: 'F009', name: '通用' }
];

// 根据面料类型获取面料大分类
function getFabricCategoryByType(fabricType) {
  if (fabricType.includes('牛仔')) {
    return '牛仔布';
  } else if (fabricType.includes('针织')) {
    return '针织布';
  } else if (fabricType.includes('梭织')) {
    return '梭织布';
  } else if (fabricType === '通用') {
    return '通用';
  } else {
    return '混纺';
  }
}

// 初始化数据库
function initProcessStandardDB(force = false) {
  // 强制重新初始化，确保新添加的机种被加载
  const initialData = generateInitialData();
  uni.setStorageSync('garment_process_standard', initialData);
  console.log('工序工时标准表数据库初始化完成');
  return initialData;
}

// 生成初始数据
function generateInitialData() {
  const processes = [
    // 梭织上衣 - 正装衬衫
    {
      process_id: 'SZ-CS-001',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '平车合前片肩缝',
      machine_type: '电脑平车',
      standard_time: 18,
      difficulty_coefficient: 1.0,
      base_price: 0.090,
      process_desc: '取前后肩片对位，平车合肩缝，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    // 特种缝纫机示例工序
    {
      process_id: 'ZZ-PC-001',
      garment_category: '针织上衣',
      sub_category: '圆领T恤',
      process_name: '冚车包边',
      machine_type: '特种缝纫机',
      sub_machine_type: '冚车',
      standard_time: 25,
      difficulty_coefficient: 1.1,
      base_price: 0.1375,
      process_desc: '使用冚车对领口进行包边处理',
      fabric_type: '针织薄料'
    },
    {
      process_id: 'SX-NZK-010',
      garment_category: '梭织下装',
      sub_category: '牛仔裤',
      process_name: '三本车加固侧缝',
      machine_type: '特种缝纫机',
      sub_machine_type: '三本车',
      standard_time: 50,
      difficulty_coefficient: 1.05,
      base_price: 0.2625,
      process_desc: '使用三本车对牛仔裤侧缝进行加固',
      fabric_type: '牛仔厚料'
    },
    {
      process_id: 'ZZ-WY-012',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '网车网布拼接',
      machine_type: '特种缝纫机',
      sub_machine_type: '网车',
      standard_time: 30,
      difficulty_coefficient: 0.98,
      base_price: 0.147,
      process_desc: '使用网车对网布面料进行拼接',
      fabric_type: '针织薄料'
    },
    {
      process_id: 'SZ-CS-002',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '平车合后片肩缝',
      machine_type: '电脑平车',
      standard_time: 16,
      difficulty_coefficient: 1.0,
      base_price: 0.080,
      process_desc: '取后片过肩对位，平车合肩缝，起止回针',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'SZ-CS-003',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '平车开衬衫单唇胸袋',
      machine_type: '电脑平车',
      standard_time: 120,
      difficulty_coefficient: 1.2,
      base_price: 0.720,
      process_desc: '画袋位，烫袋布，平车开袋，封袋口，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'SZ-CS-004',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '平车装衬衫门襟',
      machine_type: '电脑平车',
      standard_time: 45,
      difficulty_coefficient: 1.0,
      base_price: 0.225,
      process_desc: '门襟与前片对位，平车缉明线，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'SZ-CS-005',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '平车装衬衫里襟',
      machine_type: '电脑平车',
      standard_time: 40,
      difficulty_coefficient: 1.0,
      base_price: 0.200,
      process_desc: '里襟与左前片对位，平车缉线，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'SZ-CS-006',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '平车上衬衫领',
      machine_type: '电脑平车',
      standard_time: 90,
      difficulty_coefficient: 1.2,
      base_price: 0.540,
      process_desc: '领座与领面缝合，翻烫，上领与衣身对位，平车缉线，起止回针',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'SZ-CS-007',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '平车合衬衫侧缝',
      machine_type: '电脑平车',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '前后片侧缝对位，平车合缝，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'SZ-CS-008',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '平车上衬衫袖',
      machine_type: '电脑平车',
      standard_time: 60,
      difficulty_coefficient: 1.0,
      base_price: 0.300,
      process_desc: '袖片与衣身袖窿对位，平车圆袖，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'SZ-CS-009',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '平车合衬衫袖底缝',
      machine_type: '电脑平车',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '袖片内外缝对位，平车合缝，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'SZ-CS-010',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '平车卷衬衫下摆',
      machine_type: '电脑平车',
      standard_time: 35,
      difficulty_coefficient: 1.0,
      base_price: 0.175,
      process_desc: '下摆折边两次，平车缉明线，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    // 梭织上衣 - 休闲夹克
    {
      process_id: 'SZ-JK-001',
      garment_category: '梭织上衣',
      sub_category: '休闲夹克',
      process_name: '平车开夹克斜插袋',
      machine_type: '电脑平车',
      standard_time: 150,
      difficulty_coefficient: 1.2,
      base_price: 0.900,
      process_desc: '画袋位，烫袋布，平车开袋，装袋布，封袋口，起止回针',
      fabric_type: '梭织中厚料'
    },
    {
      process_id: 'SZ-JK-002',
      garment_category: '梭织上衣',
      sub_category: '休闲夹克',
      process_name: '平车合夹克前后片',
      machine_type: '电脑平车',
      standard_time: 35,
      difficulty_coefficient: 1.0,
      base_price: 0.175,
      process_desc: '前后片侧缝对位，平车合缝，起止回针，修线头',
      fabric_type: '梭织中厚料'
    },
    {
      process_id: 'SZ-JK-003',
      garment_category: '梭织上衣',
      sub_category: '休闲夹克',
      process_name: '平车上夹克拉链',
      machine_type: '电脑平车',
      standard_time: 80,
      difficulty_coefficient: 1.2,
      base_price: 0.480,
      process_desc: '拉链与门襟对位，平车固定，缉明线，起止回针，修线头',
      fabric_type: '梭织中厚料'
    },
    {
      process_id: 'SZ-JK-004',
      garment_category: '梭织上衣',
      sub_category: '休闲夹克',
      process_name: '平车上夹克翻领',
      machine_type: '电脑平车',
      standard_time: 100,
      difficulty_coefficient: 1.2,
      base_price: 0.600,
      process_desc: '领面领里缝合，翻烫，上领与衣身对位，平车缉线固定',
      fabric_type: '梭织中厚料'
    },
    {
      process_id: 'SZ-JK-005',
      garment_category: '梭织上衣',
      sub_category: '休闲夹克',
      process_name: '平车上夹克袖',
      machine_type: '电脑平车',
      standard_time: 75,
      difficulty_coefficient: 1.0,
      base_price: 0.375,
      process_desc: '袖片与袖窿对位，平车圆袖，起止回针，修线头',
      fabric_type: '梭织中厚料'
    },
    // 梭织下装 - 西裤
    {
      process_id: 'SX-XK-001',
      garment_category: '梭织下装',
      sub_category: '西裤',
      process_name: '平车开西裤后袋',
      machine_type: '电脑平车',
      standard_time: 130,
      difficulty_coefficient: 1.2,
      base_price: 0.780,
      process_desc: '画袋位，烫袋布，平车开双唇袋，装袋布，封袋口，起止回针',
      fabric_type: '梭织薄/中厚料'
    },
    {
      process_id: 'SX-XK-002',
      garment_category: '梭织下装',
      sub_category: '西裤',
      process_name: '平车开西裤斜插袋',
      machine_type: '电脑平车',
      standard_time: 110,
      difficulty_coefficient: 1.2,
      base_price: 0.660,
      process_desc: '画袋位，烫袋布，平车开袋，装袋布，封袋口，起止回针',
      fabric_type: '梭织薄/中厚料'
    },
    {
      process_id: 'SX-XK-003',
      garment_category: '梭织下装',
      sub_category: '西裤',
      process_name: '平车合西裤前片',
      machine_type: '电脑平车',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '左右前片门里襟对位，平车合缝，起止回针，修线头',
      fabric_type: '梭织薄/中厚料'
    },
    {
      process_id: 'SX-XK-004',
      garment_category: '梭织下装',
      sub_category: '西裤',
      process_name: '平车合西裤后片',
      machine_type: '电脑平车',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '左右后片裆缝对位，平车合缝，起止回针，修线头',
      fabric_type: '梭织薄/中厚料'
    },
    {
      process_id: 'SX-XK-005',
      garment_category: '梭织下装',
      sub_category: '西裤',
      process_name: '平车合西裤内外侧缝',
      machine_type: '电脑平车',
      standard_time: 40,
      difficulty_coefficient: 1.0,
      base_price: 0.200,
      process_desc: '前后片侧缝对位，平车合缝，起止回针，修线头',
      fabric_type: '梭织薄/中厚料'
    },
    {
      process_id: 'SX-XK-006',
      garment_category: '梭织下装',
      sub_category: '西裤',
      process_name: '平车合西裤下裆缝',
      machine_type: '电脑平车',
      standard_time: 35,
      difficulty_coefficient: 1.0,
      base_price: 0.175,
      process_desc: '裤腿下裆缝对位，平车合缝，起止回针，修线头',
      fabric_type: '梭织薄/中厚料'
    },
    {
      process_id: 'SX-XK-007',
      garment_category: '梭织下装',
      sub_category: '西裤',
      process_name: '平车上西裤腰头',
      machine_type: '电脑平车',
      standard_time: 90,
      difficulty_coefficient: 1.2,
      base_price: 0.540,
      process_desc: '腰头与裤身对位，平车缉线，装裤袢，起止回针，修线头',
      fabric_type: '梭织薄/中厚料'
    },
    {
      process_id: 'SX-XK-008',
      garment_category: '梭织下装',
      sub_category: '西裤',
      process_name: '平车卷西裤脚口',
      machine_type: '电脑平车',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '裤脚折边两次，平车缉明线，起止回针，修线头',
      fabric_type: '梭织薄/中厚料'
    },
    {
      process_id: 'SX-XK-009',
      garment_category: '梭织下装',
      sub_category: '西裤',
      process_name: '平车上西裤拉链',
      machine_type: '电脑平车',
      standard_time: 70,
      difficulty_coefficient: 1.2,
      base_price: 0.420,
      process_desc: '拉链与门襟对位，平车固定，缉明线，起止回针，修线头',
      fabric_type: '梭织薄/中厚料'
    },
    // 梭织下装 - 牛仔裤
    {
      process_id: 'SX-NZK-001',
      garment_category: '梭织下装',
      sub_category: '牛仔裤',
      process_name: '平车开牛仔裤后贴袋',
      machine_type: '电脑平车',
      standard_time: 60,
      difficulty_coefficient: 1.0,
      base_price: 0.300,
      process_desc: '烫袋型，袋布与后片对位，平车缉明线，起止回针，修线头',
      fabric_type: '牛仔厚料'
    },
    {
      process_id: 'SX-NZK-002',
      garment_category: '梭织下装',
      sub_category: '牛仔裤',
      process_name: '平车开牛仔裤前插袋',
      machine_type: '电脑平车',
      standard_time: 140,
      difficulty_coefficient: 1.2,
      base_price: 0.840,
      process_desc: '画袋位，烫袋布，平车开袋，装袋布，封袋口，起止回针',
      fabric_type: '牛仔厚料'
    },
    {
      process_id: 'SX-NZK-003',
      garment_category: '梭织下装',
      sub_category: '牛仔裤',
      process_name: '平车合牛仔裤前片',
      machine_type: '电脑平车',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '左右前片门里襟对位，平车合缝，起止回针，修线头',
      fabric_type: '牛仔厚料'
    },
    {
      process_id: 'SX-NZK-004',
      garment_category: '梭织下装',
      sub_category: '牛仔裤',
      process_name: '平车合牛仔裤后片',
      machine_type: '电脑平车',
      standard_time: 35,
      difficulty_coefficient: 1.0,
      base_price: 0.175,
      process_desc: '左右后片裆缝对位，平车合缝，起止回针，修线头',
      fabric_type: '牛仔厚料'
    },
    {
      process_id: 'SX-NZK-005',
      garment_category: '梭织下装',
      sub_category: '牛仔裤',
      process_name: '双针车合牛仔裤内外侧缝',
      machine_type: '双针平车',
      standard_time: 45,
      difficulty_coefficient: 1.0,
      base_price: 0.225,
      process_desc: '前后片侧缝对位，双针车合缝，起止回针，修线头',
      fabric_type: '牛仔厚料'
    },
    {
      process_id: 'SX-NZK-006',
      garment_category: '梭织下装',
      sub_category: '牛仔裤',
      process_name: '平车上牛仔裤拉链',
      machine_type: '电脑平车',
      standard_time: 85,
      difficulty_coefficient: 1.2,
      base_price: 0.510,
      process_desc: '拉链与门襟对位，平车固定，缉明线，起止回针，修线头',
      fabric_type: '牛仔厚料'
    },
    {
      process_id: 'SX-NZK-007',
      garment_category: '梭织下装',
      sub_category: '牛仔裤',
      process_name: '平车上牛仔裤腰头',
      machine_type: '电脑平车',
      standard_time: 100,
      difficulty_coefficient: 1.2,
      base_price: 0.600,
      process_desc: '腰头与裤身对位，平车缉线，装裤袢，起止回针，修线头',
      fabric_type: '牛仔厚料'
    },
    {
      process_id: 'SX-NZK-008',
      garment_category: '梭织下装',
      sub_category: '牛仔裤',
      process_name: '双针车卷牛仔裤脚口',
      machine_type: '双针平车',
      standard_time: 35,
      difficulty_coefficient: 1.0,
      base_price: 0.175,
      process_desc: '裤脚折边，双针车缉双线，起止回针，修线头',
      fabric_type: '牛仔厚料'
    },
    // 针织上衣 - 圆领T恤
    {
      process_id: 'ZZ-YLT-001',
      garment_category: '针织上衣',
      sub_category: '圆领T恤',
      process_name: '平车合肩缝',
      machine_type: '电脑平车',
      standard_time: 15,
      difficulty_coefficient: 1.0,
      base_price: 0.075,
      process_desc: '前后片肩缝对位，平车合缝，起止回针，修线头',
      fabric_type: '针织薄料'
    },
    {
      process_id: 'ZZ-YLT-002',
      garment_category: '针织上衣',
      sub_category: '圆领T恤',
      process_name: '平车合侧缝',
      machine_type: '电脑平车',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '前后片侧缝对位，平车合缝，起止回针，修线头',
      fabric_type: '针织薄料'
    },
    {
      process_id: 'ZZ-YLT-003',
      garment_category: '针织上衣',
      sub_category: '圆领T恤',
      process_name: '平车装袖',
      machine_type: '电脑平车',
      standard_time: 45,
      difficulty_coefficient: 1.0,
      base_price: 0.225,
      process_desc: '袖片与袖窿对位，平车圆袖，起止回针，修线头',
      fabric_type: '针织薄料'
    },
    {
      process_id: 'ZZ-YLT-004',
      garment_category: '针织上衣',
      sub_category: '圆领T恤',
      process_name: '平车合袖底缝',
      machine_type: '电脑平车',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '袖片内外缝对位，平车合缝，起止回针，修线头',
      fabric_type: '针织薄料'
    },
    {
      process_id: 'ZZ-YLT-005',
      garment_category: '针织上衣',
      sub_category: '圆领T恤',
      process_name: '平车上领',
      machine_type: '电脑平车',
      standard_time: 60,
      difficulty_coefficient: 1.2,
      base_price: 0.360,
      process_desc: '领圈与领条对位，平车缉线，起止回针，修线头',
      fabric_type: '针织薄料'
    },
    {
      process_id: 'ZZ-YLT-006',
      garment_category: '针织上衣',
      sub_category: '圆领T恤',
      process_name: '平车卷下摆',
      machine_type: '电脑平车',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '下摆折边，平车缉明线，起止回针，修线头',
      fabric_type: '针织薄料'
    },
    {
      process_id: 'ZZ-YLT-007',
      garment_category: '针织上衣',
      sub_category: '圆领T恤',
      process_name: '平车卷袖口',
      machine_type: '电脑平车',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '袖口折边，平车缉明线，起止回针，修线头',
      fabric_type: '针织薄料'
    },
    // 针织上衣 - 连帽卫衣
    {
      process_id: 'ZZ-WY-001',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '平车合帽片',
      machine_type: '电脑平车',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '帽片对位，平车合缝，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZZ-WY-002',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '平车装帽绳',
      machine_type: '电脑平车',
      standard_time: 45,
      difficulty_coefficient: 1.0,
      base_price: 0.225,
      process_desc: '帽绳穿入帽口，平车固定，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZZ-WY-003',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '平车合肩缝',
      machine_type: '电脑平车',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '前后片肩缝对位，平车合缝，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZZ-WY-004',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '平车合侧缝',
      machine_type: '电脑平车',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '前后片侧缝对位，平车合缝，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZZ-WY-005',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '平车装袖',
      machine_type: '电脑平车',
      standard_time: 50,
      difficulty_coefficient: 1.0,
      base_price: 0.250,
      process_desc: '袖片与袖窿对位，平车圆袖，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZZ-WY-006',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '平车合袖底缝',
      machine_type: '电脑平车',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '袖片内外缝对位，平车合缝，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZZ-WY-007',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '平车上帽',
      machine_type: '电脑平车',
      standard_time: 70,
      difficulty_coefficient: 1.2,
      base_price: 0.420,
      process_desc: '帽与衣身领口对位，平车缉线，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZZ-WY-008',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '平车开前袋',
      machine_type: '电脑平车',
      standard_time: 80,
      difficulty_coefficient: 1.2,
      base_price: 0.480,
      process_desc: '画袋位，平车开袋，装袋布，封袋口，起止回针',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZZ-WY-009',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '平车上拉链',
      machine_type: '电脑平车',
      standard_time: 60,
      difficulty_coefficient: 1.2,
      base_price: 0.360,
      process_desc: '拉链与门襟对位，平车固定，缉明线，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZZ-WY-010',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '平车卷下摆',
      machine_type: '电脑平车',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '下摆折边，平车缉明线，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZZ-WY-011',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '平车卷袖口',
      machine_type: '电脑平车',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '袖口折边，平车缉明线，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    // 针织下装 - 休闲针织裤
    {
      process_id: 'ZX-KZK-001',
      garment_category: '针织下装',
      sub_category: '休闲针织裤',
      process_name: '平车合前片',
      machine_type: '电脑平车',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '左右前片对位，平车合缝，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZX-KZK-002',
      garment_category: '针织下装',
      sub_category: '休闲针织裤',
      process_name: '平车合后片',
      machine_type: '电脑平车',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '左右后片对位，平车合缝，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZX-KZK-003',
      garment_category: '针织下装',
      sub_category: '休闲针织裤',
      process_name: '平车合内外侧缝',
      machine_type: '电脑平车',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '前后片侧缝对位，平车合缝，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZX-KZK-004',
      garment_category: '针织下装',
      sub_category: '休闲针织裤',
      process_name: '平车合下裆缝',
      machine_type: '电脑平车',
      standard_time: 35,
      difficulty_coefficient: 1.0,
      base_price: 0.175,
      process_desc: '裤腿下裆缝对位，平车合缝，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZX-KZK-005',
      garment_category: '针织下装',
      sub_category: '休闲针织裤',
      process_name: '平车上腰头',
      machine_type: '电脑平车',
      standard_time: 70,
      difficulty_coefficient: 1.2,
      base_price: 0.420,
      process_desc: '腰头与裤身对位，平车缉线，装松紧带，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'ZX-KZK-006',
      garment_category: '针织下装',
      sub_category: '休闲针织裤',
      process_name: '平车卷脚口',
      machine_type: '电脑平车',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '裤脚折边，平车缉明线，起止回针，修线头',
      fabric_type: '针织中厚料'
    },
    // 裙装 - 连衣裙
    {
      process_id: 'QZ-LYQ-001',
      garment_category: '裙装',
      sub_category: '连衣裙',
      process_name: '平车合前片',
      machine_type: '电脑平车',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '前片对位，平车合缝，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'QZ-LYQ-002',
      garment_category: '裙装',
      sub_category: '连衣裙',
      process_name: '平车合后片',
      machine_type: '电脑平车',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '后片对位，平车合缝，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'QZ-LYQ-003',
      garment_category: '裙装',
      sub_category: '连衣裙',
      process_name: '平车合侧缝',
      machine_type: '电脑平车',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '前后片侧缝对位，平车合缝，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'QZ-LYQ-004',
      garment_category: '裙装',
      sub_category: '连衣裙',
      process_name: '平车上袖',
      machine_type: '电脑平车',
      standard_time: 50,
      difficulty_coefficient: 1.0,
      base_price: 0.250,
      process_desc: '袖片与袖窿对位，平车圆袖，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'QZ-LYQ-005',
      garment_category: '裙装',
      sub_category: '连衣裙',
      process_name: '平车合袖底缝',
      machine_type: '电脑平车',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '袖片内外缝对位，平车合缝，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'QZ-LYQ-006',
      garment_category: '裙装',
      sub_category: '连衣裙',
      process_name: '平车上领',
      machine_type: '电脑平车',
      standard_time: 80,
      difficulty_coefficient: 1.2,
      base_price: 0.480,
      process_desc: '领与领口对位，平车缉线，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'QZ-LYQ-007',
      garment_category: '裙装',
      sub_category: '连衣裙',
      process_name: '平车上拉链',
      machine_type: '电脑平车',
      standard_time: 60,
      difficulty_coefficient: 1.2,
      base_price: 0.360,
      process_desc: '拉链与后中对位，平车固定，缉明线，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'QZ-LYQ-008',
      garment_category: '裙装',
      sub_category: '连衣裙',
      process_name: '平车卷下摆',
      machine_type: '电脑平车',
      standard_time: 35,
      difficulty_coefficient: 1.0,
      base_price: 0.175,
      process_desc: '下摆折边，平车缉明线，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'QZ-LYQ-009',
      garment_category: '裙装',
      sub_category: '连衣裙',
      process_name: '平车卷袖口',
      machine_type: '电脑平车',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '袖口折边，平车缉明线，起止回针，修线头',
      fabric_type: '梭织薄料'
    },
    // 通用后道工序
    {
      process_id: 'HD-001',
      garment_category: '通用后道',
      sub_category: '后道工序',
      process_name: '剪线头',
      machine_type: '手工',
      standard_time: 60,
      difficulty_coefficient: 1.0,
      base_price: 0.300,
      process_desc: '修剪服装表面线头，保证整洁',
      fabric_type: '通用'
    },
    {
      process_id: 'HD-002',
      garment_category: '通用后道',
      sub_category: '后道工序',
      process_name: '整烫',
      machine_type: '烫台',
      standard_time: 90,
      difficulty_coefficient: 1.0,
      base_price: 0.450,
      process_desc: '整烫服装，保证平整度和造型',
      fabric_type: '通用'
    },
    {
      process_id: 'HD-003',
      garment_category: '通用后道',
      sub_category: '后道工序',
      process_name: '质检',
      machine_type: '手工',
      standard_time: 45,
      difficulty_coefficient: 1.0,
      base_price: 0.225,
      process_desc: '检查服装质量，确保符合标准',
      fabric_type: '通用'
    },
    {
      process_id: 'HD-004',
      garment_category: '通用后道',
      sub_category: '后道工序',
      process_name: '包装',
      machine_type: '手工',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '折叠服装，装入包装',
      fabric_type: '通用'
    },
    {
      process_id: 'HD-005',
      garment_category: '通用后道',
      sub_category: '后道工序',
      process_name: '钉扣',
      machine_type: '钉扣机',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '在指定位置钉扣',
      fabric_type: '通用'
    },
    {
      process_id: 'HD-006',
      garment_category: '通用后道',
      sub_category: '后道工序',
      process_name: '锁眼',
      machine_type: '锁眼机',
      standard_time: 15,
      difficulty_coefficient: 1.0,
      base_price: 0.075,
      process_desc: '在指定位置锁扣眼',
      fabric_type: '通用'
    },
    // 新增机种示例工序
    {
      process_id: 'ZZ-PC-002',
      garment_category: '针织上衣',
      sub_category: '圆领T恤',
      process_name: '双针平缝机压线',
      machine_type: '双针平缝机',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '使用双针平缝机进行双线平行压线',
      fabric_type: '针织薄料'
    },
    {
      process_id: 'SZ-CS-011',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '三线包缝机锁边',
      machine_type: '三线包缝机',
      standard_time: 15,
      difficulty_coefficient: 1.0,
      base_price: 0.075,
      process_desc: '使用三线包缝机进行单层裁片锁边',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'SZ-JK-006',
      garment_category: '梭织上衣',
      sub_category: '休闲夹克',
      process_name: '四线包缝机拼缝',
      machine_type: '四线包缝机',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '使用四线包缝机进行双层裁片拼缝锁边',
      fabric_type: '梭织中厚料'
    },
    {
      process_id: 'SX-NZK-011',
      garment_category: '梭织下装',
      sub_category: '牛仔裤',
      process_name: '五线包缝机加固',
      machine_type: '五线包缝机',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '使用五线包缝机进行厚料拼缝锁边',
      fabric_type: '牛仔厚料'
    },
    {
      process_id: 'ZZ-YLT-008',
      garment_category: '针织上衣',
      sub_category: '圆领T恤',
      process_name: '2针3线绷缝机折边',
      machine_type: '2针3线绷缝机',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '使用2针3线绷缝机进行针织领口折边',
      fabric_type: '针织薄料'
    },
    {
      process_id: 'ZZ-WY-013',
      garment_category: '针织上衣',
      sub_category: '连帽卫衣',
      process_name: '3针5线绷缝机拼接',
      machine_type: '3针5线绷缝机',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '使用3针5线绷缝机进行针织肩袖拼接',
      fabric_type: '针织中厚料'
    },
    {
      process_id: 'SZ-CS-012',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '平头锁眼机锁眼',
      machine_type: '平头锁眼机',
      standard_time: 15,
      difficulty_coefficient: 1.0,
      base_price: 0.075,
      process_desc: '使用平头锁眼机进行衬衫门襟锁眼',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'SZ-JK-007',
      garment_category: '梭织上衣',
      sub_category: '休闲夹克',
      process_name: '圆头锁眼机锁眼',
      machine_type: '圆头锁眼机',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '使用圆头锁眼机进行西装门襟锁眼',
      fabric_type: '梭织中厚料'
    },
    {
      process_id: 'HD-007',
      garment_category: '通用后道',
      sub_category: '后道工序',
      process_name: '套结机加固',
      machine_type: '套结机',
      standard_time: 10,
      difficulty_coefficient: 1.0,
      base_price: 0.050,
      process_desc: '使用套结机进行袋口两端加固',
      fabric_type: '通用'
    },
    {
      process_id: 'SZ-CS-013',
      garment_category: '梭织上衣',
      sub_category: '正装衬衫',
      process_name: '埋夹机埋夹',
      machine_type: '埋夹机',
      standard_time: 30,
      difficulty_coefficient: 1.0,
      base_price: 0.150,
      process_desc: '使用埋夹机进行衬衫侧缝埋夹',
      fabric_type: '梭织薄料'
    },
    {
      process_id: 'SX-XK-010',
      garment_category: '梭织下装',
      sub_category: '西裤',
      process_name: '暗缝机挑脚',
      machine_type: '暗缝机',
      standard_time: 25,
      difficulty_coefficient: 1.0,
      base_price: 0.125,
      process_desc: '使用暗缝机进行西裤裤脚暗缝',
      fabric_type: '梭织薄/中厚料'
    },
    {
      process_id: 'ZZ-YLT-009',
      garment_category: '针织上衣',
      sub_category: '圆领T恤',
      process_name: '曲折缝机拼接',
      machine_type: '曲折缝机',
      standard_time: 20,
      difficulty_coefficient: 1.0,
      base_price: 0.100,
      process_desc: '使用曲折缝机进行弹性面料拼接',
      fabric_type: '针织薄料'
    }
  ];
  
  // 为每个工序添加面料大分类
  return processes.map(process => ({
    ...process,
    fabric_category: getFabricCategoryByType(process.fabric_type)
  }));
}

// 获取所有工序数据
function getAllProcesses() {
  return uni.getStorageSync('garment_process_standard') || [];
}

// 根据品类获取工序
function getProcessesByCategory(category) {
  const allProcesses = getAllProcesses();
  return allProcesses.filter(process => process.garment_category === category);
}

// 根据细分品类获取工序
function getProcessesBySubCategory(subCategory) {
  const allProcesses = getAllProcesses();
  return allProcesses.filter(process => process.sub_category === subCategory);
}

// 根据机种获取工序
function getProcessesByMachineType(machineType) {
  const allProcesses = getAllProcesses();
  return allProcesses.filter(process => process.machine_type === machineType);
}

// 根据面料类型获取工序
function getProcessesByFabricType(fabricType) {
  const allProcesses = getAllProcesses();
  return allProcesses.filter(process => process.fabric_type === fabricType);
}

// 搜索工序
function searchProcesses(keyword) {
  const allProcesses = getAllProcesses();
  return allProcesses.filter(process => 
    process.process_name.includes(keyword) ||
    process.process_desc.includes(keyword) ||
    process.process_id.includes(keyword)
  );
}

// 获取工序详情
function getProcessById(processId) {
  const allProcesses = getAllProcesses();
  return allProcesses.find(process => process.process_id === processId);
}

// 获取所有服装大类
function getGarmentCategories() {
  const allProcesses = getAllProcesses();
  const categories = new Set();
  allProcesses.forEach(process => categories.add(process.garment_category));
  return Array.from(categories);
}

// 获取所有细分品类
function getSubCategories() {
  const allProcesses = getAllProcesses();
  const subCategories = new Set();
  allProcesses.forEach(process => subCategories.add(process.sub_category));
  return Array.from(subCategories);
}

// 获取所有机种
function getMachineTypes() {
  const allProcesses = getAllProcesses();
  const machineTypes = new Set();
  allProcesses.forEach(process => machineTypes.add(process.machine_type));
  return Array.from(machineTypes);
}

// 获取所有面料类型
function getFabricTypes() {
  const allProcesses = getAllProcesses();
  const fabricTypes = new Set();
  allProcesses.forEach(process => fabricTypes.add(process.fabric_type));
  return Array.from(fabricTypes);
}

// 获取所有面料大分类
function getFabricCategories() {
  return fabricCategories.map(category => category.name);
}

// 根据面料大分类获取工序
function getProcessesByFabricCategory(fabricCategory) {
  const allProcesses = getAllProcesses();
  return allProcesses.filter(process => process.fabric_category === fabricCategory);
}

// 根据面料大分类和工序名称查询标准工时
function queryTimeByFabricAndOperation(fabricCategory, operationName) {
  const allProcesses = getAllProcesses();
  return allProcesses.filter(process => 
    process.fabric_category === fabricCategory &&
    (process.process_name.includes(operationName) || process.process_desc.includes(operationName))
  );
}

// 导出模块
export {
  initProcessStandardDB,
  getAllProcesses,
  getProcessesByCategory,
  getProcessesBySubCategory,
  getProcessesByMachineType,
  getProcessesByFabricType,
  getProcessesByFabricCategory,
  searchProcesses,
  queryTimeByFabricAndOperation,
  getProcessById,
  getGarmentCategories,
  getSubCategories,
  getMachineTypes,
  getFabricTypes,
  getFabricCategories,
  generateInitialData
};