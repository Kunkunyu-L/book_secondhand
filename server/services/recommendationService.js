/**
 * 智能推荐服务
 * 算法：基于用户专业 + 图书分类 + 热度 + 时间的混合推荐算法
 */
const db = require("../db/config");

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, r) => (err ? reject(err) : resolve(r)));
  });

/**
 * 专业关键词映射表
 * 用于将用户专业映射到图书的关键词
 */
const MAJOR_KEYWORDS = {
  '计算机': ['计算机', '编程', 'Python', 'Java', 'C语言', '数据结构', '算法', '软件工程', '人工智能', '机器学习', '数据库', '操作系统', '网络', '前端', '后端'],
  '软件工程': ['计算机', '编程', '软件', '架构', '开发', '工程', '项目管理'],
  '数字媒体技术': ['数字媒体', '多媒体', '设计', '图像处理', '视频', '动画', 'UI', 'UX', '平面设计'],
  '计算机应用技术': ['计算机', '编程', '网络', '数据库', '软件', '应用'],
  '数学': ['数学', '高等数学', '线性代数', '概率论', '数理统计', '数学分析', '微积分', '离散数学'],
  '物理': ['物理', '力学', '电磁', '量子', '热力学', '光学', '声学', '大学物理'],
  '化学': ['化学', '有机化学', '无机化学', '分析化学', '物理化学', '生物化学'],
  '生物': ['生物', '生物学', '遗传学', '细胞', '分子生物', '生态', '进化'],
  '经济': ['经济', '经济学', '微观经济', '宏观经济', '金融', '贸易', '投资'],
  '金融': ['金融', '投资', '财务', '会计', '银行', '证券', '保险', '经济'],
  '管理': ['管理', '管理学', '企业管理', '人力资源', '市场营销', '战略', '组织行为'],
  '会计': ['会计', '审计', '财务', '税务', '成本会计', '管理会计'],
  '中文': ['文学', '汉语', '写作', '古典', '诗词', '现当代文学', '古代文学', '语言学'],
  '历史': ['历史', '中国史', '世界史', '近代史', '古代史', '文明', '考古'],
  '英语': ['英语', '英文', '口语', '雅思', '托福', 'GRE', '词汇', '语法', '翻译'],
  '日语': ['日语', '日本', '假名', ' kanji ', '日语能力考试'],
  '法学': ['法律', '民法', '刑法', '宪法', '诉讼', '法理', '行政法'],
  '教育': ['教育', '心理学', '教学', '课程', '教育技术', '学前教育'],
  '心理学': ['心理', '心理学', '认知', '行为', '发展心理', '社会心理'],
  '艺术': ['艺术', '设计', '美术', '绘画', '音乐', '雕塑', '摄影'],
  '建筑': ['建筑', '建筑设计', '结构', '材料', '施工', '建筑史'],
  '机械': ['机械', '机械设计', '制造', '自动化', '机电', '制图'],
  '电气': ['电气', '电子', '电路', '电力', '自动化', '控制'],
  '土木': ['土木', '结构', '力学', '材料', '施工', '工程'],
  '医学': ['医学', '临床', '解剖', '生理', '病理', '药理', '内科', '外科'],
  '护理': ['护理', '护士', '临床护理', '护理学'],
  '药学': ['药学', '药物', '药理', '药剂', '药物化学'],
  '环境': ['环境', '环保', '污染', '生态', '治理'],
  '材料': ['材料', '材料科学', '金属', '高分子', '复合材料']
};

/**
 * 分类权重配置
 * 某些分类对推荐分数的影响
 */
const CATEGORY_WEIGHT = {
  1: 1.2,  // 大学教材 - 更适合大学生
  2: 1.0,  // 小说
  3: 0.9,  // 悬疑故事
  4: 1.1   // 科技
};

/**
 * 计算图书的推荐分数
 * @param {Object} book - 图书对象
 * @param {Object} user - 用户对象(包含major, school等)
 * @returns {number} 推荐分数
 */
function calculateRecommendScore(book, user) {
  let score = 0;

  // 1. 专业匹配得分 (权重: 40%)
  if (user && user.major) {
    const majorKeywords = MAJOR_KEYWORDS[user.major] || [user.major];
    const searchText = `${book.title || ''} ${book.author || ''} ${book.tags || ''} ${book.category_name || ''}`.toLowerCase();

    for (const keyword of majorKeywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        score += 40;
      }
    }
  }

  // 2. 分类权重得分 (权重: 20%)
  if (book.category && CATEGORY_WEIGHT[book.category]) {
    score += 20 * CATEGORY_WEIGHT[book.category];
  }

  // 3. 热度得分 (权重: 25%)
  // 使用销量或付款次数作为热度指标
  const popularity = book.sales_count || book.nope || 0;
  score += Math.min(popularity * 5, 25); // 最高25分

  // 4. 时间衰减得分 (权重: 15%)
  // 新发布的图书得分更高，30天内的图书满分
  if (book.create_datetime) {
    const bookDate = new Date(book.create_datetime);
    const now = new Date();
    const daysDiff = Math.floor((now - bookDate) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 30) {
      score += 15 * (1 - daysDiff / 30);
    } else if (daysDiff <= 90) {
      score += 5 * (1 - (daysDiff - 30) / 60);
    }
  }

  // 5. 成色加分 (权重: 10%)
  // 成色好的图书推荐分数更高
  if (book.bcp_condition) {
    score += book.bcp_condition * 1; // 7-10分，对应7-10分
  }

  return Math.round(score * 100) / 100; // 保留两位小数
}

/**
 * 为用户生成个性化推荐列表
 * @param {number} userId - 用户ID
 * @param {number} limit - 返回数量限制
 * @returns {Array} 推荐图书列表
 */
async function getPersonalizedRecommendations(userId, limit = 50) {
  try {
    // 获取用户信息
    const userResult = await query(
      'SELECT id, username, major, school, nickname FROM user WHERE id = ?',
      [userId]
    );

    if (userResult.length === 0) {
      return [];
    }

    const user = userResult[0];

    // 获取所有在售图书
    const allBooks = await getAllOnSaleBooks();

    // 为每本书计算推荐分数
    const scoredBooks = allBooks.map(book => ({
      ...book,
      recommend_score: calculateRecommendScore(book, user)
    }));

    // 按推荐分数排序，取前limit个
    const recommendations = scoredBooks
      .sort((a, b) => b.recommend_score - a.recommend_score)
      .slice(0, limit);

    return recommendations;

  } catch (error) {
    console.error('生成个性化推荐失败:', error);
    throw error;
  }
}

/**
 * 获取所有在售图书（平台+用户）
 */
async function getAllOnSaleBooks() {
  const sql = `
    (
      SELECT
        ub.id,
        ub.user_id,
        ub.isbn,
        ub.title,
        ub.author,
        ub.publisher,
        ub.publish_date,
        ub.category,
        ub.tags,
        ub.status,
        ub.cover_img,
        ub.detail_imgs,
        ub.book_story,
        ub.nope,
        ub.create_datetime,
        ub.update_datetime,
        NULL AS description,
        NULL AS sales_count,
        bcp.id AS bcp_id,
        bcp.type AS bcp_type,
        bcp.book_id AS bcp_book_id,
        bcp.condition AS bcp_condition,
        bcp.condition_desc AS bcp_condition_desc,
        bcp.original_price AS bcp_original_price,
        bcp.price AS bcp_price,
        bcp.stock AS bcp_stock,
        u.nickname,
        u.avatar,
        'user' AS source
      FROM user_book ub
      LEFT JOIN book_condition_price bcp
        ON ub.id = bcp.book_id AND bcp.type = 'user'
      LEFT JOIN \`user\` u
        ON ub.user_id = u.id
      WHERE ub.status = 'onsale'
    )
    UNION ALL
    (
      SELECT
        pb.id,
        pb.user_id,
        pb.isbn,
        pb.title,
        pb.author,
        pb.publisher,
        pb.publish_date,
        pb.category,
        pb.tags,
        pb.status,
        pb.cover_img,
        pb.detail_imgs,
        NULL AS book_story,
        NULL AS nope,
        pb.create_datetime,
        pb.update_datetime,
        pb.description,
        pb.sales_count,
        bcp.id AS bcp_id,
        bcp.type AS bcp_type,
        bcp.book_id AS bcp_book_id,
        bcp.condition AS bcp_condition,
        bcp.condition_desc AS bcp_condition_desc,
        bcp.original_price AS bcp_original_price,
        bcp.price AS bcp_price,
        bcp.stock AS bcp_stock,
        NULL AS nickname,
        NULL AS avatar,
        'platform' AS source
      FROM platform_book pb
      LEFT JOIN book_condition_price bcp
        ON pb.id = bcp.book_id AND bcp.type = 'platform'
      WHERE pb.status = 'onsale'
    )
  `;

  const result = await query(sql);

  // 为每本书添加分类名称（批量查询）
  const categoryIds = [...new Set(result.map(b => b.category).filter(Boolean))];
  const categoryMap = {};

  if (categoryIds.length > 0) {
    const categories = await query(
      `SELECT id, name FROM book_category WHERE id IN (${categoryIds.map(() => '?').join(',')})`,
      categoryIds
    );
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });
  }

  result.forEach(book => {
    book.category_name = categoryMap[book.category] || '';
  });

  return result;
}

/**
 * 基于专业获取推荐（不登录情况下）
 * @param {string} major - 专业名称
 * @param {number} limit - 返回数量限制
 */
async function getRecommendationsByMajor(major, limit = 50) {
  try {
    const mockUser = { major: major };
    const allBooks = await getAllOnSaleBooks();

    const scoredBooks = allBooks.map(book => ({
      ...book,
      recommend_score: calculateRecommendScore(book, mockUser)
    }));

    return scoredBooks
      .sort((a, b) => b.recommend_score - a.recommend_score)
      .slice(0, limit);

  } catch (error) {
    console.error('基于专业生成推荐失败:', error);
    throw error;
  }
}

module.exports = {
  calculateRecommendScore,
  getPersonalizedRecommendations,
  getRecommendationsByMajor,
  getAllOnSaleBooks,
  MAJOR_KEYWORDS,
  CATEGORY_WEIGHT
};
