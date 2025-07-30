class Gear {
  constructor(x, y, fullRadius, angle, direction, speed, color, stroke, blur=true) {
    this.canvas = document.createElement("canvas");

    this.radius = fullRadius;

    this.context = this.canvas.getContext("2d");

    this.x = x;
    this.y = y;

    this.angle = angle;
    this.direction = direction;
    this.speed = speed;

    this.color = color;
    this.stroke = stroke;

    this.blur = blur;

    this.draw();
  }
  draw() {
    this.canvas.width = this.radius * 2;
    this.canvas.height = this.radius * 2;

    if(this.blur) {
      this.context.filter = "blur(0.2em)";
    }

    let innerRadius = this.radius * 0.8;
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.context.fillStyle = this.color;
    this.context.beginPath();
    
    let increment = TWO_PI / 10;
    
    const spoke_width = increment / 2;
    
    const slope_width = spoke_width / 2;
    
    for(let currentAngle = 0; currentAngle < TWO_PI; currentAngle += increment) {
      let leftTopCornerAngle = currentAngle - slope_width * 0.75;
      let rightTopCornerAngle = currentAngle + slope_width * 0.75;
      
      let leftCornerAngle = leftTopCornerAngle - slope_width * 0.5;
      let rightCornerAngle = rightTopCornerAngle + slope_width * 0.5;
      
      this.context.lineTo(
        centerX + Math.cos(leftCornerAngle) * innerRadius,
        centerY + Math.sin(leftCornerAngle) * innerRadius
      );
      this.context.lineTo(
        centerX + Math.cos(leftTopCornerAngle) * this.radius,
        centerY + Math.sin(leftTopCornerAngle) * this.radius
      );
      this.context.lineTo(
        centerX + Math.cos(rightTopCornerAngle) * this.radius,
        centerY + Math.sin(rightTopCornerAngle) * this.radius
      );
      this.context.lineTo(
        centerX + Math.cos(rightCornerAngle) * innerRadius,
        centerY + Math.sin(rightCornerAngle) * innerRadius
      );
    }
    
    this.context.closePath();
    this.context.fill();
    if(this.stroke) {
      this.context.strokeStyle = this.stroke;
      this.context.stroke();
    }
  }
}
class GearField {
  constructor(context, x, y, width, height) {
    this.context = context;
    
    Object.assign(this, {x, y, width, height});
    
    this.gears = [];
  }
  
  drawGear(gear) {
    this.context.translate(gear.x, gear.y);
    this.context.rotate(gear.angle);
    this.context.translate(-gear.radius, -gear.radius);
    this.context.drawImage(gear.canvas, 0, 0);
    this.context.translate(gear.radius, gear.radius);
    this.context.rotate(-gear.angle);
    this.context.translate(-gear.x, -gear.y);
  }

  
  addGear(x, y, radius, angle, direction, speed, color) {
    let g = new Gear(x, y, radius, angle, direction, speed, color);
    this.gears.push(g);
    return g;
  }
  
  draw(dt, scrollDiff) {
    this.context.translate(this.x, this.y);
    this.gears.forEach(gear => {
      gear.angle += gear.speed * scrollDiff * gear.direction;
      this.drawGear(gear);
    });
    this.context.translate(-this.x, -this.y);
  }
  
  findOverlappingGear(x, y, radius, color) {
    let overlap = this.gears.find(gear => {
      if(gear.color !== color) {
        return false;
      }
      let dx = (this.x + gear.x) - x;
      let dy = (this.y + gear.y) - y;
      let radii = gear.radius + radius;
      
      return (dx * dx) + (dy * dy) < radii * radii;
    });
    return overlap;
  }
  buildMeshFromGear(lastGear) {
    let gearCount = 1 + Math.floor(Math.random() * 2);
    
    let radius = lastGear.radius;
    let color = lastGear.color;
    
    let attemptCount = 0;
    
    while(gearCount > 0) {
      attemptCount++;
      let nextGearAngle = Math.floor(Math.random() * 10) * TWO_PI / 10;
      let newX = lastGear.x + Math.cos(nextGearAngle) * radius * 1.85;
      let newY = lastGear.y + Math.sin(nextGearAngle) * radius * 1.85;
      
      let newAngle = lastGear.angle + TWO_PI / 10 / 2;
      if(newX < this.width && newY < this.height && newX > 0 && newY > 0 && !findAnyOverlappingGear(this.x + newX, this.y + newY, radius * 0.8, color)) {
        attemptCount = 0;
        gearCount--;
        lastGear = this.addGear(newX, newY, radius, newAngle, lastGear.direction * -1, lastGear.speed, color);
        if(color === MID_COLOR && Math.random() < 0.3) {
          let newGear = this.addGear(lastGear.x, lastGear.y, lastGear.radius / 2, lastGear.angle, lastGear.direction, lastGear.speed, LIGHT_COLOR);
          this.buildMeshFromGear(newGear);
        }
      }
      if(attemptCount > 20) {
        // bailing out
        return;
      }
    } 
  }
  buildMesh(color) {
    let startX = Math.random() * this.width;
    let startY = Math.random() * this.height;
    
    let radius = 150;
    if(color === DARK_COLOR) {
      radius = 200;
    }
    
    if(color === LIGHT_COLOR) {
      radius = 60;
    }
    
    let lastGear = {x: startX, y: startY, radius, angle: 0, direction: 1, speed: GEAR_SPEED, color};
    
    this.buildMeshFromGear(lastGear)
  }
  
  generate() {
    this.buildMesh(DARK_COLOR);
    this.buildMesh(DARK_COLOR);
    this.buildMesh(MID_COLOR);
    this.buildMesh(MID_COLOR);
    this.buildMesh(LIGHT_COLOR);
    
    this.gears.sort((a, b) => {
      return colors.indexOf(a.color) - colors.indexOf(b.color);
    })
  }
}

function findAnyOverlappingGear(x, y, radius, color) {
  return gearFields.find(g => g.findOverlappingGear(x, y, radius, color));
}

let canvas = document.getElementById("gears");

let context = canvas.getContext("2d");

const LIGHT_COLOR = "#ffffff";
const MID_COLOR = "#ccece7";
const DARK_COLOR = "#25655a";

const colors = [DARK_COLOR, MID_COLOR, LIGHT_COLOR];

const RENDER_WIDTH = 1500;
const RENDER_HEIGHT = 700;

const TWO_PI = Math.PI * 2;

const GEAR_SPEED = 0.0020;

let scale = 1;

let gearFields = [];

let lastUpdateTime = null;

let lastScrollPosition = window.scrollY;

let PRIMARY_GEAR_SIZE = 200;

const primaryGearContainer = document.getElementById("primaryGearContainer");
const primaryGearCanvas = document.getElementById("primaryGears");
const primaryGearContext = primaryGearCanvas.getContext("2d");
const primaryGearField = new GearField(primaryGearContext, 0, 0, 0, 0);
const primaryGear = new Gear(0, 0, PRIMARY_GEAR_SIZE / 2, 0, -1, GEAR_SPEED, MID_COLOR, DARK_COLOR, false);

function animate(time) {
  requestAnimationFrame(animate);
  
  if(lastUpdateTime === null) {
    lastUpdateTime = time;
  }
  let dt = time - lastUpdateTime;
  
  if(dt > 16) {
    dt = 16;
  }

  let scrollDiff = window.scrollY - lastScrollPosition;
  lastScrollPosition = window.scrollY;
  
  
  if(scrollDiff !== 0 && lastScrollPosition < 460) { // don't re-render if unneeded
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.save();
    context.scale(scale, scale);

    gearFields.forEach(field => {
      field.draw(dt, scrollDiff);
    });

    primaryGear.angle += scrollDiff * GEAR_SPEED;
    primaryGearCanvas.width = PRIMARY_GEAR_SIZE;
    primaryGearCanvas.height = PRIMARY_GEAR_SIZE;
    primaryGear.x = PRIMARY_GEAR_SIZE / 2;
    primaryGear.y = PRIMARY_GEAR_SIZE / 2;
    primaryGearField.drawGear(primaryGear);
    
    context.restore();
  }
  
  
  lastUpdateTime = time;

}

const QUAD_SIZE = 600;

function setCanvasToWindowSize() {
  let box = masthead.getBoundingClientRect();
  canvas.width = box.width;
  canvas.height = box.height;
  
  for(let quadX = 0; quadX < canvas.width / QUAD_SIZE; quadX++) {
    for(let quadY = 0; quadY < canvas.height / QUAD_SIZE; quadY++) {
      let existingQuad = gearFields.find(f => f.x === quadX * QUAD_SIZE && f.y === quadY * QUAD_SIZE);
      if(!existingQuad) {
        let g = new GearField(context, quadX * QUAD_SIZE, quadY * QUAD_SIZE, QUAD_SIZE, QUAD_SIZE);
        gearFields.push(g);
        g.generate();
      }
    }
  }

  let primaryBox = primaryGearContainer.getBoundingClientRect();
  PRIMARY_GEAR_SIZE = primaryBox.width;

  gearFields.forEach(field => {
    field.draw(0, 0);
  });

  primaryGearCanvas.width = PRIMARY_GEAR_SIZE;
  primaryGearCanvas.height = PRIMARY_GEAR_SIZE;
  primaryGear.x = PRIMARY_GEAR_SIZE / 2;
  primaryGear.y = PRIMARY_GEAR_SIZE / 2;

  primaryGear.radius = PRIMARY_GEAR_SIZE / 2;
  primaryGear.draw();

  primaryGearField.drawGear(primaryGear);
}

setCanvasToWindowSize();
window.addEventListener("resize", setCanvasToWindowSize);

requestAnimationFrame(animate);


// adjust anchor offset to account for floating header
function scrollToCurrentHash() {
  let hash = window.location.hash;
  if(!hash) {
    return;
  }
  let matchingAnchor = document.querySelector(hash);
  if(matchingAnchor) {
    let rect = matchingAnchor.getBoundingClientRect();
    let headerRect = document.querySelector("header").getBoundingClientRect();
    let targetOffset = window.pageYOffset + rect.top - headerRect.height;

    window.scrollTo(window.pageXOffset, targetOffset);
  }
}

window.addEventListener("load", scrollToCurrentHash);
window.addEventListener('hashChange', scrollToCurrentHash);