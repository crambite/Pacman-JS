//board
let board;
const tile_size = 32;
const row_count = 21;
const column_count = 19;
const board_height = row_count * tile_size;
const board_width = column_count * tile_size;
let context;

//map
const map = [
    "XXXXOXXXXXXXXXXXXXX",
    "Xr       X       oX",
    "X XX XXX X XXX XX X",
    "X      X       X  X",
    "X XX X XXXXX X X XX",
    "X    X       X    X",
    "XX X   XXXXX X XX X",
    "X  XXXXX          X",
    "XXXX   X XXXXX X XX",
    "O    X   X     X  O",
    "X XX XXX X X X XX X",
    "X        X X X    X",
    "X XXXX XXX X XXXX X",
    "X          X      X",
    "X XXXXXXX XXXX XX X",
    "X  X     P     X  X",
    "XX X X XX XX X X  X",
    "X    X    X  X    X",
    "X XX XXX XX XXXXX X",
    "Xp        X      bX",
    "XXXXOXXXXXXXXXXXXXX" 
];

//objects
const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;

//ghost directions
const directions = ["U", "D", "L", "R", "U", "D"];

//images
let iorange_ghost;
let iblue_ghost;
let ipink_ghost;
let ired_ghost;
let ipacman_up;
let ipacman_down;
let ipacman_left;
let ipacman_right;
let iwall;

//assign images to their variables (i in fornt of variable means image)
function load_images() {

    iwall = new Image();
    iwall.src = "Images/wall.png";

    iorange_ghost = new Image();
    iorange_ghost.src = "Images/orangeGhost.png";
    iblue_ghost = new Image();
    iblue_ghost.src = "Images/blueGhost.png";
    ipink_ghost = new Image();
    ipink_ghost.src = "Images/pinkGhost.png";
    ired_ghost = new Image();
    ired_ghost.src = "Images/redGhost.png";

    ipacman_up = new Image();
    ipacman_up.src = "Images/pacmanUp.png";
    ipacman_down = new Image();
    ipacman_down.src = "Images/pacmanDown.png";
    ipacman_left = new Image();
    ipacman_left.src = "Images/pacmanLeft.png";
    ipacman_right = new Image();
    ipacman_right.src = "Images/pacmanRight.png";

}

//functions making the game run
class Block{
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.start_x = x;
        this.start_y = y;

        this.direction = "";
        this.velocity_x = 0;
        this.velocity_y = 0;

    }

    update_direction(direction) {
        const prev_direction = this.direction
        this.direction = direction;
        this.update_velocity();

        //ensures we continue moving in the same direction if we hit a wall
        this.x += this.velocity_x;
        this.y += this.velocity_y;

        for(let wall of walls.values()) {
            if (collision(wall, this)) {
                this.x -= this.velocity_x;
                this.y -= this.velocity_y;
                this.direction = prev_direction;
                this.update_velocity();
                return;
            }
        }

        //updates pacman's image to correspond with direction
        if (pacman.direction == "U") {
            pacman.image = ipacman_up;
        }
        else if (pacman.direction == "D") {
            pacman.image = ipacman_down;
        }
        else if (pacman.direction == "L") {
            pacman.image = ipacman_left;
        }
        else if (pacman.direction == "R") {
            pacman.image = ipacman_right;
        }
    }

    //distance of movement
    update_velocity() {
        if (this.direction == "U") {
            this.velocity_x = 0;
            this.velocity_y = -tile_size / 4;
        }
        else if (this.direction == "D") {
            this.velocity_x = 0;
            this.velocity_y = tile_size / 4;
        }
        else if (this.direction == "L") {
            this.velocity_x = -tile_size / 4;
            this.velocity_y = 0;
        }
        else if (this.direction == "R") {
            this.velocity_x = tile_size / 4;
            this.velocity_y = 0;
        }
    }

    //teleport
    update_pos() {
        
        if (this.x + this.width < 0) {
            this.x = board_width;
        }
        else if (this.x > board_width) {
            this.x = 0;
        }
        else if (this.y + this.height < 0) {
            this.y = board_height;
        }
        else if (this.y > board_height) {
            this.y = 0;
        }
    }
}

function load_game() {

    walls.clear();
    foods.clear();
    ghosts.clear();

    //check position for image (r and c are currently pixel size)
    for (let r = 0; r < row_count; r++) {
        for (let c = 0; c < column_count; c++) {

            const row = map[r];
            const tile_map_char = row[c];
            
            //making x and y corresponding to tile size
            const x = c * tile_size;
            const y = r * tile_size;
        
            //adds images to their respective sets
            if (tile_map_char == "X") {
                const wall = new Block(iwall, x, y, tile_size, tile_size);
                walls.add(wall);
            }
            else if (tile_map_char == "o") {
                const ghost = new Block(iorange_ghost, x, y, tile_size, tile_size);
                ghosts.add(ghost);
            }
            else if (tile_map_char == "b") {
                const ghost = new Block(iblue_ghost, x, y, tile_size, tile_size);
                ghosts.add(ghost);
            }
            else if (tile_map_char == "p") {
                const ghost = new Block(ipink_ghost, x, y, tile_size, tile_size);
                ghosts.add(ghost);
            }
            else if (tile_map_char == "r") {
                const ghost = new Block(ired_ghost, x, y, tile_size, tile_size);
                ghosts.add(ghost);
            }
            else if (tile_map_char == "P") {
                pacman = new Block(ipacman_right, x , y, tile_size, tile_size);
            }
            else if (tile_map_char == " ") {
                const food = new Block(null, x + 14, y + 14, 4, 4);
                foods.add(food);
            }
        }
    }
}

function draw() {

    context.clearRect(0, 0, board_width, board_height);

    //pacman
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);

    //ghost
    for (let ghost of ghosts.values()) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }

    //walls
    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }

    //food
    context.fillStyle = "white"
    for (let food of foods.values()) {
        context.fillRect(food.x, food.y, food.width, food.height);
    }
}

//check keyboard input to update direction of entity
function pacman_direction(e) {

    if (e.code == "ArrowUp" || e.code == "KeyW") {
        pacman.update_direction("U");
    }
    else if (e.code == "ArrowDown" || e.code == "KeyS") {
        pacman.update_direction("D");
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        pacman.update_direction("L");
    }
    else if (e.code == "ArrowRight" || e.code == "KeyD") {
        pacman.update_direction("R");
    }
}

//actually moving pacman on screen
function move() {

    //pacman
    //move pacman
    pacman.x += pacman.velocity_x;
    pacman.y += pacman.velocity_y;

    //check for collision
    for (let wall of walls.values()) {

        if (collision(wall, pacman)) {
            pacman.x -= pacman.velocity_x;
            pacman.y -= pacman.velocity_y;
            break;
        }
    }
    //if pacman enters open hole, he teleports to the other side
    pacman.update_pos()

    //ghosts
    for (let ghost of ghosts.values()) {

        //move ghost
        ghost.x += ghost.velocity_x;
        ghost.y += ghost.velocity_y;

        //check for collision
        for (let wall of walls.values()) {

            if (collision(wall, ghost)) {
                ghost.x -= ghost.velocity_x;
                ghost.y -= ghost.velocity_y;
                const new_direction = directions[Math.floor(Math.random() * 6)];
                ghost.update_direction(new_direction);
                break;
            }
        }

        //if ghost enters open hole, he teleports to the other side
        ghost.update_pos()
    }
}

//function for collision written in a_direction, b_direction to visualise the collision points
function collision(a, b) {

    const a_right = a.x;
    const a_left = a.x + a.width;
    const a_top = a.y;
    const a_bottom = a.y + a.height;
    
    const b_right = b.x;
    const b_left = b.x + a.width;
    const b_top = b.y;
    const b_bottom = b.y + a.height;
    

    return  a_right < b_left &&
            a_left > b_right &&
            a_top < b_bottom &&
            a_bottom > b_top;
}

function update() {
    move();
    draw();
    setTimeout(update, 50); //20fps
}

//run game
window.onload = function() {

    board = document.getElementById("board");
    board.height = board_height;
    board.width = board_width;
    context = board.getContext("2d");

    load_images();
    load_game();
    //console.log(walls.size);
    //console.log(foods.size);
    //console.log(ghosts.size);
 
    update();
    this.document.addEventListener("keydown", pacman_direction);
    
    for (ghost of ghosts.values()) {
        const new_direction = directions[Math.floor(Math.random() * 6)];
        ghost.update_direction(new_direction);
    }
    
   
}
