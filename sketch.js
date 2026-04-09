// Gruvbox colors
const background_darkmode = "#282828";
const colors_darkmode = [
  "#d79921",
  "#d65d0e",
  "#cc241d",
  "#b16286",
  "#458588",
  "#689d6a",
  "#98971a",
];

const background_lightmode = "#ebdbb2";

const radialCells = 24;
const layers = 6;
const minRadProp = 0.15;
const maxRadProp = 0.45;
const arcSubdivisions = 4;

let grid = [];
let colors = [];
let t = 0;
let cnv;

function setup() {
  const container = document.getElementById("sketch-container");
  const w = container.offsetWidth || windowWidth;
  const h = container.offsetHeight || 400;

  cnv = createCanvas(w, h);
  cnv.parent("sketch-container");

  initGrid();
  background(background_darkmode);
}

function initGrid() {
  grid = [];
  colors = [];
  t = 0;

  for (let i = 0; i < layers; i++) {
    let newLayer = [];
    for (let j = 0; j < radialCells; j++) {
      newLayer.push({
        filled: false,
        col: undefined,
        dT: 0,
        arrival: 0,
      });
    }
    grid.push(newLayer);
  }

  for (let i = 0; i < radialCells; i++) {
    colors.push(floor(random(colors_darkmode.length)));
  }
}

function draw() {
  t += deltaTime * 0.001;

  background(background_darkmode);
  translate(width / 2, height / 2);

  stroke(background_lightmode);
  strokeWeight(1);
  noFill();
  drawGrid();

  let randCell = floor(random(radialCells));
  if (random() < noise(randCell, frameCount * 0.01) * 0.1) {
    for (let i = 0; i < layers; i++) {
      let colIndex =
        (colors_darkmode.length +
          colors[randCell] +
          floor(map(noise(randCell * 0.7, i * 0.7), 0, 1, -1, 2))) %
        colors_darkmode.length;

      if (!grid[i][randCell].filled) {
        grid[i][randCell] = {
          filled: true,
          col: colors_darkmode[colIndex],
          dT: 5.0,
          arrival: t + 2.0,
        };
        break;
      }
    }
  }
}

function drawGrid() {
  const baseSize = height * 0.9;

  for (let i = 0; i < radialCells; i++) {
    let theta = map(i, 0, radialCells, 0, TWO_PI) + PI;
    let x1 = cos(theta) * baseSize * minRadProp;
    let y1 = sin(theta) * baseSize * minRadProp;
    let x2 = cos(theta) * baseSize * maxRadProp;
    let y2 = sin(theta) * baseSize * maxRadProp;

    line(x1, y1, x2, y2);
  }

  for (let i = 0; i < layers + 1; i++) {
    let d = map(i, 0, layers, minRadProp, maxRadProp) * 2;
    circle(0, 0, d * baseSize);
  }

  let halfLayerHeight = ((maxRadProp - minRadProp) / layers) * baseSize * 0.5;
  let halfCellAngle = (TWO_PI / radialCells) * 0.5;

  for (let i = 0; i < layers; i++) {
    for (let j = 0; j < radialCells; j++) {
      if (!grid[i][j].filled) continue;

      let theta = map(j, 0, radialCells, 0, TWO_PI) + halfCellAngle;
      let finalR =
        map(i, 0, layers, minRadProp, maxRadProp) * baseSize + halfLayerHeight;

      let myT = constrain(
        1.0 - (grid[i][j].arrival - t) / grid[i][j].dT,
        0.0,
        1.0
      );

      let r = map(myT, 0, 1, finalR * 15, finalR);

      fill(grid[i][j].col);
      noStroke();
      drawCell(theta, r, baseSize);
      stroke(background_lightmode);
      noFill();
    }
  }
}

function drawCell(theta, r, baseSize) {
  let halfAngle = (TWO_PI / radialCells) * 0.5;
  let halfR = ((maxRadProp - minRadProp) / layers) * baseSize * 0.5;

  beginShape();
  vertex(
    cos(theta - halfAngle) * (r + halfR),
    sin(theta - halfAngle) * (r + halfR)
  );

  for (let i = 0; i <= arcSubdivisions; i++) {
    let a = theta + map(i, 0, arcSubdivisions, -1, 1) * halfAngle;
    vertex(cos(a) * (r + halfR), sin(a) * (r + halfR));
  }

  vertex(
    cos(theta + halfAngle) * (r - halfR),
    sin(theta + halfAngle) * (r - halfR)
  );

  for (let i = 0; i <= arcSubdivisions; i++) {
    let a = theta + map(i, 0, arcSubdivisions, 1, -1) * halfAngle;
    vertex(cos(a) * (r - halfR), sin(a) * (r - halfR));
  }

  endShape(CLOSE);
}

function windowResized() {
  const container = document.getElementById("sketch-container");
  const w = container.offsetWidth || windowWidth;
  const h = container.offsetHeight || 400;
  resizeCanvas(w, h);
  initGrid();
}
