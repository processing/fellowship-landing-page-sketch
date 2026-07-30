/*
 * ===== #WCCC_Construction =====
 * Made for the weekly creative code challenge hosted by @Sableraph 
 * Discord: discord.gg/h9yJJYwy
 * Twitch: twitch.tv/Sableraph
 * 
 * 
 */





// colors gruvbox theme https://github.com/morhetz/gruvbox
const background_darkmode = '#282828';
const colors_darkmode = ['#d79921', '#d65d0e', '#cc241d', '#b16286', '#458588', '#689d6a', '#98971a'];

const background_lightmode = "#ebdbb2";
const colors_lightmode = ['#b57614', '#af3a03', '#9d0006', '#8f3f71', '#076678', '#427b58', '#79740e'];

const radialCells = 24;
const layers = 6;
const minRadProp = 0.15;
const maxRadProp = 0.45;

const arcSubdivisions = 4; // determines how smooth the arcs of the cells are drawn;


let grid = [];

let shapes = [];

let colors = [];

let t = 0; 


function setup() {
	createCanvas(windowWidth, windowHeight);
	describe("i radial grid centered on the screen slowly gets filled up with differently colored blocks that float in from the edges of the screen")
	
	for(let i = 0; i < layers; i++) {
		let newLayer = [];
		for(let j = 0; j < radialCells; j++) {
			newLayer.push({
				filled: false,
				col: undefined,
				dT: 0,
		      arrival:0
			});
		}
		grid.push(newLayer);
	}

	background(background_darkmode);

	for(let i = 0; i < radialCells; i++) {
		colors.push(floor(random(colors_darkmode.length)));
	}
}

function draw() {
	t += deltaTime * 0.001;

	translate(width / 2, height / 2);
	background(background_darkmode);
	
	stroke(background_lightmode);
	noFill();
	drawGrid();

	let randCell = floor(random(radialCells));
	if(random() < noise(randCell) * 0.1) {
		for(let i = 0; i < layers; i++) {
			let colIndex = (colors_darkmode.length + colors[randCell] + floor(map(noise(randCell * 0.7, i * 0.7), 0, 1, -1, 2))) % colors_darkmode.length;
			if(!grid[i][randCell].filled) {
				grid[i][randCell] = {
					filled: true,
					col: colors_darkmode[colIndex],
					dT: 5.0,
					arrival: t + 2.0
				}
				break;
			}
		}
	}
}

function drawGrid() {
	for(let i = 0; i < radialCells; i++) {
		let theta = map(i, 0, radialCells, 0, TWO_PI) + PI;
		let x1 = cos(theta) * height * minRadProp;
		let y1 = sin(theta) * height * minRadProp;
		let x2 = cos(theta) * height * maxRadProp;
		let y2 = sin(theta) * height * maxRadProp;

		line(x1, y1, x2, y2)
	}

	for(let i = 0; i < layers + 1; i++) {
		let d = map(i, 0, layers, minRadProp, maxRadProp) * 2;
		circle(0, 0, d * height);
	}

	let halfLayerHeight = ((maxRadProp - minRadProp) / layers) * height * 0.5;
	let halfCellAngle = (TWO_PI / radialCells) * 0.5;
	for(let i = 0; i < layers; i++) {
		for(let j = 0; j < radialCells; j++) {
			if(!grid[i][j].filled) {
				continue;
			}
			let theta = map(j, 0, radialCells, 0, TWO_PI) + halfCellAngle;
			let finalR = map(i, 0, layers, minRadProp, maxRadProp) * height + halfLayerHeight;

			let myT = min(max(1.0 - ((grid[i][j].arrival - t) / grid[i][j].dT), 0.0), 1.0)

			let r = map(myT, 0, 1, finalR * 15, finalR);
			
			fill(grid[i][j].col);
			drawCell(theta, r);
		}
	}
}

function worldToGrid(wX, wY) {
	let angle = p5.Vector.angleBetween(createVector(1, 0), createVector(wX, wY));
	let r = dist(0, 0, wX, wY);

	return {angle, r};
}

function drawCell(theta, r) {
	let halfAngle = TWO_PI / radialCells * 0.5;
	let halfR = ((maxRadProp - minRadProp) / layers) * height * 0.5;
	
	beginShape();
		vertex(cos(theta - halfAngle) * (r + halfR), sin(theta - halfAngle) * (r + halfR));

		for(let i = 0; i <= arcSubdivisions; i++) {
			let t = theta + map(i, 0, arcSubdivisions, -1, 1) * halfAngle;
			vertex(cos(t) * (r + halfR), sin(t) * (r + halfR));
		}
	
	
		vertex(cos(theta + halfAngle) * (r - halfR), sin(theta + halfAngle) * (r - halfR));

		for(let i = 0; i <= arcSubdivisions; i++) {
			let t = theta + map(i, 0, arcSubdivisions, 1, -1) * halfAngle;
			vertex(cos(t) * (r - halfR), sin(t) * (r - halfR));
		}
	endShape(CLOSE);
}
