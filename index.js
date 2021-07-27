var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

const resolution = 20;
canvas.width = 700;
canvas.height = 700;

const COLS = canvas.width / resolution;
const ROWS = canvas.height / resolution;

function buildGrid(){
	return new Array(COLS).fill(null)
		.map(() => new Array(ROWS).fill(0));
}

function updateCell(grid, clickEvent){
	const gridLeft = canvas.offsetLeft + canvas.clientLeft;
	const gridTop = canvas.offsetTop + canvas.clientTop;

	var x =	clickEvent.pageX - gridLeft;
	var y = clickEvent.pageY - gridTop;

	//determine which pixel was clicked
	const col = Math.floor(x/resolution);
	const row = Math.floor(y/resolution);
	grid[col][row] = 1 - grid[col][row];
	renderGrid(grid);
}

function nextGen(currGrid){
	var newGrid = buildGrid();
	for (let col = 0 ; col < currGrid.length ; col++){
		for (let row = 0 ; row < currGrid[col].length ; row++){
			let neighbors = 0;
			if (col > 0 && row > 0){ //add the topleft square (1)
				neighbors += currGrid[col-1][row-1];
			}
			if (col > 0){ //4
				neighbors += currGrid[col-1][row];
			}
			if (row > 0){ //2
				neighbors += currGrid[col][row-1];
			}
			if (col < currGrid.length-1 && row < currGrid.length-1){ //9
				neighbors += currGrid[col+1][row+1];
			}
			if (col < currGrid.length-1){ //6
				neighbors += currGrid[col+1][row];
			}
			if (row < currGrid.length-1){ //8
				neighbors += currGrid[col][row+1];
			}
			if (row < currGrid.length-1 && col > 0 ){ //7
				neighbors += currGrid[col-1][row+1];
			}
			if (row > 0 && col < currGrid.length-1){ //+
				neighbors += currGrid[col+1][row-1];
			}

			//now calc the next stage
			if (neighbors < 2){ //underpopulation
				newGrid[col][row] = 0;
			}
			else if (neighbors === 2 && currGrid[col][row] === 1){ //stays alive
				newGrid[col][row] = 1;
			}
			else if (neighbors === 3){ //born
				newGrid[col][row] = 1;
			}
			else if (neighbors > 3){ //overpopulation
				newGrid[col][row] = 0;
			}
		}
	}
	//count number of black squares in the new generation
	let alive = 0;
		for (let col = 0 ; col < currGrid.length ; col++){
			for (let row = 0 ; row < currGrid[col].length ; row++){
				alive += currGrid[col][row];
			}
		}
	document.getElementById("curr_alive").innerHTML = "Current population: " + alive;
	if (alive > max_alive){
		max_alive = alive;
		max_alive_gen = gens;
	}

	if (JSON.stringify(currGrid)==JSON.stringify(newGrid)){
		document.getElementById("stuck").innerHTML = "you reached a stable generation!";
		toggle_game();
	}

	return newGrid;
}

function renderGrid(grid){
	for (let col = 0 ; col < grid.length ; col++){
		for (let row = 0 ; row < grid[col].length ; row++){
			const cell = grid[col][row];

			ctx.beginPath();
			ctx.rect(col*resolution, row*resolution, resolution, resolution);
			ctx.fillStyle = cell ? 'black' : 'white'
			ctx.fill();
			ctx.stroke();
		}
	}
}

function toggle_game(){
	if (!game_running){
		canvas.removeEventListener('mousedown',_listener , false);
		id = setInterval(update, 250);
		document.getElementById("start_btn").innerHTML = "stop";
		game_running = true;
	}
	else{
		canvas.addEventListener('mousedown',_listener , false);
		clearTimeout(id);
		document.getElementById("start_btn").innerHTML = "start";
		game_running = false;
		//reset stable msg
	}
}

function fill_board_random(){
	if (game_running){
		alert("cannot randomize board while running!")
		return;
	}
	currGrid = new Array(COLS).fill(null)
		.map(() => new Array(ROWS).fill(null)
			.map(() => Math.floor(Math.random() * 2)));

	renderGrid(currGrid);
	//restart stats
	gens = 1;
	max_alive = 0;
	max_alive_gen = 1;
	document.getElementById("stuck").innerHTML = "";
	document.getElementById("gens").innerHTML = "Generation 0";
	document.getElementById("max_alive").innerHTML = "Best population: 0 at round 0";
	document.getElementById("curr_alive").innerHTML = "Current population: 0";
}

function update(){
	currGrid = nextGen(currGrid);
	renderGrid(currGrid);
	document.getElementById("gens").innerHTML = "Generation " + gens++;
	document.getElementById("max_alive").innerHTML = "Best population:  " + max_alive + " at round " + max_alive_gen;
	console.log(currGrid);
}

function clear_board(){
	if (game_running){
		alert("cannot clear board while running!")
		return;
	}
	currGrid = new Array(COLS).fill(null)
		.map(() => new Array(ROWS).fill(0));

	renderGrid(currGrid);
	//restart stats
	gens = 1;
	max_alive = 0;
	max_alive_gen = 1;
	document.getElementById("stuck").innerHTML = "";
	document.getElementById("gens").innerHTML = "Generation 0";
	document.getElementById("max_alive").innerHTML = "Best population: 0 at round 0";
	document.getElementById("curr_alive").innerHTML = "Current population: 0";
}

let currGrid = buildGrid();
var game_running = false;
var id;
var gens = 1;
var max_alive = 0;
var max_alive_gen = 1;
var _listener = (event) => updateCell(currGrid, event);
renderGrid(currGrid);
//let id = setInterval(update, 250);
canvas.addEventListener('mousedown',_listener , false);
//get button