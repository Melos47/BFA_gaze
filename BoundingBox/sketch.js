let faceMesh;
let bodyPose;
let videos = []; // 存储多个摄像头
let faces = [];
let poses = [];
let deviceIDs = [
 "68f51382736fedbb210984efedd896da8c40265d3513d791c052b1f9f3612ab7"
]; // 你的摄像头 ID

let options = { maxFaces: 10, refineLandmarks: false, flipHorizontal: true };

function setup() {
  createCanvas(640, 480);
  
  for (let i = 0; i < deviceIDs.length; i++) {
    let constraints = {
      video: {
        deviceId: deviceIDs[i] // 选择特定摄像头
      }
    };
    videos[i] = createCapture(constraints); // 创建不同的摄像头输入
    videos[i].size(640, 480);
    videos[i].hide();
  }

  // 让主摄像头使用 videos[0]
  let mainVideo = videos[0];

  // 加载模型（必须在摄像头创建后）
  faceMesh = ml5.faceMesh(options, () => {
    console.log("FaceMesh model loaded");
    faceMesh.detectStart(mainVideo, gotFaces);
  });

  bodyPose = ml5.bodyPose({ flipped: true }, () => {
    console.log("BodyPose model loaded");
    bodyPose.detectStart(mainVideo, gotPoses);
  });

  frameRate(21);
}

function draw() {
  clear();
  let mainVideo = videos[0];

  // 确保视频可用后再绘制
  if (mainVideo) {
    image(mainVideo, 0, 0, width, height);
    mainVideo.loadPixels();

    if (mainVideo.pixels.length > 0) {
      pixelatedBody(mainVideo);
    }
  }

  // 绘制人脸检测框
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    rect(face.box.xMin, face.box.yMin, face.box.width, face.box.height);
  }

  // 绘制人体检测框
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    noFill();
    stroke(0, 0, 255);
    strokeWeight(2);
    rect(pose.box.xMin, pose.box.yMin, pose.box.width, pose.box.height);
    fill(0, 0, 255);
    rect(pose.box.xMin, pose.box.yMin - 60, 100, 60);

    textAlign(TOP);
    textSize(40);
    fill(255);
    noStroke();
    text("null", pose.box.xMin, pose.box.yMin - 20);
  }
}

// 处理像素化身体效果
function pixelatedBody(video) {
  const stepSize = 10;

  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];

    for (let y = pose.box.yMin; y < pose.box.yMax; y += stepSize) {
      for (let x = pose.box.xMin; x < pose.box.xMax; x += stepSize) {
        let index = floor(x + y * video.width) * 4;
        const r = video.pixels[index + 0];
        const g = video.pixels[index + 1];
        const b = video.pixels[index + 2];

        // 计算亮度
        const brightness = (r + g + b) / 3;
        const squareSize = map(brightness, 0, 255, 0, stepSize * 2);

        noStroke();
        fill(random(190, 255), g, b, random(225, 255));
        rect(x, y, stepSize, stepSize);
      }
    }
  }
}

// FaceMesh 检测回调
function gotFaces(results) {
  faces = results;
}

// BodyPose 检测回调
function gotPoses(results) {
  poses = results;
}

// 按空格键输出检测到的姿态数据
function keyPressed() {
  if (key == " ") {
    console.log(poses);
  }
}
