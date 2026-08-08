/* ===========================================================
   示范路线 — 大使命探索之旅
   共享数据：检查点内容、队伍顺序、段落
   =========================================================== */

const CP_DATA = {
  1: {
    name: "车库",
    where: "请前往靠近建筑物的草坪区域，靠近大门。寻找&ldquo;大宅&rdquo;解说牌 &mdash; 牌子顶部有独特的徽章标志，非常显眼。",
    riddle: "在牌子上，找到靠近底部的一段文字，其标题写着：<em>&ldquo;Galaxy New ___.&rdquo;</em> 请在现场阅读牌子，填写该标题缺失的最后一个单词 &mdash; 这个单词就是您的关键词。",
    pattern: 5,
    answer: "known",
    map: "assets/images/cp1-map.jpg",
    board: "assets/images/cp1-board.jpg"
  },
  2: {
    name: "进化园",
    where: "沿着标示路线前往花园。进入后，寻找&ldquo;猴子家谱&rdquo;展板，它讲述了猴子如何在花园中占据主导地位的故事。",
    riddle: "在牌子上，阅读英文段落的最后一句：<em>&ldquo;&hellip;supervised the ___ of the monkey.&rdquo;</em> 从这句话的最后一个单词开始倒数（&ldquo;feet&rdquo; 是倒数第1个单词）。隐藏的单词是这句话的<strong>倒数第5个单词</strong>。",
    pattern: 7,
    answer: "mission",
    map: "assets/images/cp2-map.jpg",
    board: "assets/images/cp2-board.jpg"
  }
};

// 每支队伍的检查点顺序（检查点编号，按需前往的顺序排列）
const TEAMS = {
  "Demo": { label: "示范队", sequence: [1, 2] }
};

// 最终段落。{n} 标记由对应检查点答案填入的空格
const PASSAGE_TEMPLATE = "Ralph D. Winter, is a prominent 20th-century American missiologist and Presbyterian missionary. He became well {1} as the advocate for pioneer outreach among unreached people groups. Billy Graham once wrote: “Ralph Winter has not only helped promote evangelism among many {2} boards around the world, but by his research, training and publishing he has accelerated world evangelization.”";

// 标记每个空格编号对应哪个检查点提供答案
const BLANK_SOURCE_CP = { 1: 1, 2: 2 };
