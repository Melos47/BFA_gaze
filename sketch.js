let faceMesh;
let bodyPose;
let videoModel;
let videoDisplay;
let faces = [];
let poses = [];
let deviceIDs = [
  "68f51382736fedbb210984efedd896da8c40265d3513d791c052b1f9f3612ab7"
]; // Camera device ID
let options = { maxFaces: 4, refineLandmarks: false, flipHorizontal: true };
let scaler = 1;
let leftScreen = true;


function setup() {
  createCanvas(1920, 1080);

  
  // Create capture for specific device
  let constraintsModel = {
    video: {
      deviceId: deviceIDs[0] // Use specific camera ID
    }
  };

  // Create capture for specific device
  let constraintsDisplay = {
    video: {
      deviceId: deviceIDs[0] // Use specific camera ID
    }
  };
  
  videoModel = createCapture(constraintsModel); // Initialize the videoModel with the constraints
  videoModel.size(640, 360);
  videoModel.hide();

  videoDisplay = createCapture(VIDEO)
  videoDisplay.size(1920, 1080)
  videoDisplay.hide()

  scaler = videoDisplay.width / videoModel.width;
  
  // Initialize face mesh and body pose models
  faceMesh = ml5.faceMesh(options, () => {
    console.log("FaceMesh model loaded");
    faceMesh.detectStart(videoModel, gotFaces);
  });

  bodyPose = ml5.bodyPose({ flipped: true }, () => {
    console.log("BodyPose model loaded");
    bodyPose.detectStart(videoModel, gotPoses);
  });

  frameRate(21);
}

function draw() {
  clear();
  
  // Draw flipped video
   if (videoDisplay) {
    push(); // Save the current drawing state
    scale(-1, 1); // Flip the canvas horizontally
    image(videoDisplay, -width, 0, width, height); // Adjust the x-position since the canvas is flipped
    pop(); // Restore the drawing state

    videoDisplay.loadPixels();

    if (videoDisplay.pixels.length > 0) {
      pixelatedBody(); // Apply pixelation effect on the video
    }
  }

  // Draw face bounding boxes
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    rect(face.box.xMin * scaler, face.box.yMin * scaler, face.box.width * scaler, face.box.height * scaler);
  }

  // Draw body bounding boxes
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    noFill();
    stroke(0, 0, 255);
    strokeWeight(2);
    rect(pose.box.xMin * scaler, pose.box.yMin * scaler, pose.box.width * scaler, pose.box.height * scaler);
    fill(0, 0, 255);
    rect(pose.box.xMin * scaler, pose.box.yMin * scaler - 60, 100, 60);

    textAlign(TOP);
    textSize(40);
    fill(255);
    noStroke();
    text("null", pose.box.xMin * scaler, pose.box.yMin * scaler - 20);
  }
}

// Pixelated body effect
function pixelatedBody() {
  const stepSize = 6;

  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];

    for (let y = pose.box.yMin * scaler; y < pose.box.yMax * scaler; y += stepSize) {
      for (let x = pose.box.xMin * scaler; x < pose.box.xMax * scaler; x += stepSize) {
        let index = floor(x + y * videoDisplay.width) * 4;
        const r = videoDisplay.pixels[index + 0];
        const g = videoDisplay.pixels[index + 1];
        const b = videoDisplay.pixels[index + 2];

        // Get the brightness of the current pixel by averaging the color values
        const brightness = (r + g + b) / 3;
        const squareSize = map(brightness, 0, 255, 0, stepSize * 2);

        noStroke();
        fill(random(190, 255), g, b, random(225, 255));
        // Draw a rectangle using the color of the current pixel
        rect(x, y, stepSize, stepSize);
      }
    }
  }
}

// Callback for face detection results
function gotFaces(results) {
  faces = results;
}

// Callback for body pose detection results
function gotPoses(results) {
  poses = results;
}

 

function keyPressed() {
  if (key == " ") {
    console.log(poses);
  } else if (key == "L") {
    //leftScreen = true;
    let myCanvas = document.getElementById("defaultCanvas0")
    myCanvas.style.left = "0"


  } else if (key == "R") {
    //leftScreen = false;
    let myCanvas = document.getElementById("defaultCanvas0")
    myCanvas.style.left = "-100%";
  }
}


setTimeout(function(){
  // refresh the page
  window.location.href = window.location.href;
}, 20000)