function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}

// 宣告變數，用來存放待機、跑步、施法特效與飛行效果四張圖片精靈圖檔
let stopSheet;
let runSheet;
let actionSheet;
let effectSheet;

// 設定待機圖片精靈的規格（共 10 張，總寬 1395，高 196）
const stopFrames = 10;
const stopSheetW = 1395;
const stopSheetH = 196;

// 設定跑步圖片精靈的規格（共 9 張，總寬 1741，高 162）
const runFrames = 9;
const runSheetW = 1741;
const runSheetH = 162;

// 設定角色施法特效圖片精靈的規格（共 19 張，總寬 6360，高 248）
const actionFrames = 19;
const actionSheetW = 6360;
const actionSheetH = 248;

// 設定發射出去的飛行效果圖片精靈的規格（共 3 張，總寬 757，高 229）
const effectFrames = 3;
const effectSheetW = 757;
const effectSheetH = 229;

// 宣告變數，記錄目前角色狀態（'stop' 待機、'run' 跑步、'action' 施法動作）
let currentState = 'stop';

// 宣告變數，記錄角色面向的方向（1 代表面向右邊，-1 代表面向左邊）
let facing = 1;

// 宣告變數，記錄角色目前的中心點 X 座標
let charX;

// 設定角色每次更新畫面的水平移動速度（像素）
const moveSpeed = 12;

// 宣告變數，用來記錄角色目前播放到第幾張畫格（從 0 開始計算）
let currentFrame = 0;

// 宣告陣列，用來存放目前畫面上所有正在飛行的「效果」物件
let projectiles = [];

// 設定飛行效果每次更新畫面的移動速度（像素）
const projectileSpeed = 25;

// 預載入函式：在程式開始執行前，先將外部圖片資源載入記憶體
function preload() {
  // 載入待機圖片精靈檔案
  stopSheet = loadImage('1/stop/STOP.png');

  // 載入跑步圖片精靈檔案
  runSheet = loadImage('1/run/run.png');

  // 載入角色施法特效圖片精靈檔案
  actionSheet = loadImage('1/特效/特效.png');

  // 載入飛行效果圖片精靈檔案
  effectSheet = loadImage('1/效果/效果.png');
}

// 初始化設定函式：程式啟動時只會執行一次
function setup() {
  // 建立一個與瀏覽器視窗一樣大的全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  // 初始化角色水平位置在畫布正中央
  charX = width / 2;

  // 設定動畫的播放速度為每秒 12 幀（可依需求調整快慢）
  frameRate(12);
}

// 繪圖循環函式：會依據設定的 frameRate 不斷重複執行
function draw() {
  // 設定畫布背景顏色為天空藍色（RGB 色碼）
  background(135, 206, 235);

  // 計算角色垂直置中的中心點 Y 座標
  let charY = height / 2;

  // 只有在「非施法動作（action）」期間，才允許使用左右方向鍵移動與轉向
  if (currentState !== 'action') {
    // 偵測鍵盤右方向鍵是否被按住
    if (keyIsDown(RIGHT_ARROW)) {
      // 如果原本不是跑步狀態，切換為跑步並將畫格歸零
      if (currentState !== 'run') {
        currentState = 'run';
        currentFrame = 0;
      }
      // 設定角色面向右邊
      facing = 1;
      // 角色 X 座標向右增加
      charX += moveSpeed;
    } 
    // 偵測鍵盤左方向鍵是否被按住
    else if (keyIsDown(LEFT_ARROW)) {
      // 如果原本不是跑步狀態，切換為跑步並將畫格歸零
      if (currentState !== 'run') {
        currentState = 'run';
        currentFrame = 0;
      }
      // 設定角色面向左邊
      facing = -1;
      // 角色 X 座標向左減少
      charX -= moveSpeed;
    }
  }

  // 宣告變數來存放當前角色狀態對應的圖檔與尺寸資訊
  let activeSheet, totalFrames, sheetW, sheetH;

  // 依據目前角色狀態決定要使用哪一組圖片精靈數據
  if (currentState === 'action') {
    activeSheet = actionSheet;
    totalFrames = actionFrames;
    sheetW = actionSheetW;
    sheetH = actionSheetH;
  } else if (currentState === 'run') {
    activeSheet = runSheet;
    totalFrames = runFrames;
    sheetW = runSheetW;
    sheetH = runSheetH;
  } else {
    activeSheet = stopSheet;
    totalFrames = stopFrames;
    sheetW = stopSheetW;
    sheetH = stopSheetH;
  }

  // 計算單一張畫格的原始寬度與原始高度
  let frameWidth = sheetW / totalFrames;
  let frameHeight = sheetH;

  // 計算角色顯示在畫布上的目標高度（設定為整個畫布高度的 1/3）
  let displayHeight = height / 3;

  // 計算高度的縮放比率（顯示高度除以單張原圖高度）
  let scaleRatio = displayHeight / frameHeight;

  // 依照相同的縮放比率計算顯示寬度，確保角色不會變形
  let displayWidth = frameWidth * scaleRatio;

  // 限制角色中心點 X 座標的活動範圍，確保角色不會超出畫布左右邊界
  charX = constrain(charX, displayWidth / 2, width - displayWidth / 2);

  // 計算目前畫格在原始圖片精靈中的 X 軸裁切起點
  let sourceX = currentFrame * frameWidth;

  // 計算目前畫格在原始圖片精靈中的 Y 軸裁切起點
  let sourceY = 0;

  // 儲存目前的畫布座標與變形狀態（準備繪製角色 1）
  push();

  // 將畫布原點移動到角色的中心點位置
  translate(charX, charY);

  // 依據角色面向的方向進行水平翻轉（1 為原方向，-1 為左右鏡像翻轉）
  scale(facing, 1);

  // 設定圖片繪製模式為以中心點對齊
  imageMode(CENTER);

  // 在原點 (0, 0) 繪製裁切出來的角色單張畫格
  image(activeSheet, 0, 0, displayWidth, displayHeight, sourceX, sourceY, frameWidth, frameHeight);

  // 恢復原本的畫布座標與變形狀態
  pop();

  // 判斷目前是否正在執行空白鍵的「施法特效（action）」動作
  if (currentState === 'action') {
    // 將畫格索引值加 1
    currentFrame++;

    // 檢查 19 張圖片是否已經全部播放完畢（索引值達到 19）
    if (currentFrame >= totalFrames) {
      // 產生一個新的飛行效果物件，加入 projectiles 陣列中
      projectiles.push({
        x: charX + (facing * displayWidth * 0.4), // 從角色前方位置發射
        y: charY,                                 // 與角色同一個垂直高度
        dir: facing,                              // 記錄發射當下角色面向的方向（1 往右，-1 往左）
        frame: 0                                  // 飛行效果動畫從第 0 張開始播放
      });

      // 施法動作執行一次完畢後，將角色狀態切回待機（'stop'）並歸零畫格
      currentState = 'stop';
      currentFrame = 0;
    }
  } else {
    // 若為待機或跑步狀態，則讓動畫在範圍內無限循環播放
    currentFrame = (currentFrame + 1) % totalFrames;
  }

  // 呼叫自訂函式，更新並繪製所有正在飛行中的「效果」圖片
  updateAndDrawProjectiles();
}

// 更新與繪製飛行效果的函式
function updateAndDrawProjectiles() {
  // 計算單張飛行效果畫格的原始寬度與原始高度
  let effFrameW = effectSheetW / effectFrames;
  let effFrameH = effectSheetH;

  // 依照與角色相同的比例概念，設定飛行效果的顯示高度（畫布高度的 1/4）
  let effDisplayH = height / 4;

  // 計算飛行效果的等比例縮放比率與顯示寬度
  let effScale = effDisplayH / effFrameH;
  let effDisplayW = effFrameW * effScale;

  // 使用反向迴圈走訪所有飛行效果物件（方便在物件超出邊界時安全移除）
  for (let i = projectiles.length - 1; i >= 0; i--) {
    // 取得目前的飛行效果物件
    let p = projectiles[i];

    // 依據發射方向更新 X 座標（dir 為 1 往右移動，dir 為 -1 往左移動）
    p.x += p.dir * projectileSpeed;

    // 計算目前飛行效果畫格在原始圖片精靈中的 X 軸裁切起點
    let effSourceX = p.frame * effFrameW;

    // 儲存畫布狀態（準備繪製飛行效果）
    push();

    // 將原點移動到飛行效果的目前位置
    translate(p.x, p.y);

    // 依據飛行方向決定是否左右翻轉圖片
    scale(p.dir, 1);

    // 設定圖片以中心點對齊繪製
    imageMode(CENTER);

    // 繪製飛行效果的單張畫格
    image(effectSheet, 0, 0, effDisplayW, effDisplayH, effSourceX, 0, effFrameW, effFrameH);

    // 恢復畫布狀態
    pop();

    // 更新飛行效果的動畫畫格（在 3 張之間循環播放）
    p.frame = (p.frame + 1) % effectFrames;

    // 檢查是否已經移動到畫布最右端或最左端之外
    if ((p.dir === 1 && p.x - effDisplayW / 2 > width) || (p.dir === -1 && p.x + effDisplayW / 2 < 0)) {
      // 若已完全離開畫布邊界，將該飛行效果從陣列中移除（消失不見）
      projectiles.splice(i, 1);
    }
  }
}

// 鍵盤按下事件函式：每次按下按鍵的瞬間觸發一次
function keyPressed() {
  // 判斷按下的按鍵是否為空白鍵（鍵碼 32 或 ' '）
  if (keyCode === 32 || key === ' ') {
    // 只有在目前沒有正在施法時，才觸發新的施法動作（避免連按導致動作中斷重來）
    if (currentState !== 'action') {
      // 切換狀態為施法特效（'action'）
      currentState = 'action';
      // 畫格索引歸零，確保從第 1 張開始完整播放 19 張
      currentFrame = 0;
    }
  }
}

// 視窗大小改變事件函式：當使用者調整瀏覽器視窗或旋轉手機螢幕時自動觸發
function windowResized() {
  // 重新調整畫布大小以符合新的視窗寬高，達到自適應不同載具的效果
  resizeCanvas(windowWidth, windowHeight);
}
