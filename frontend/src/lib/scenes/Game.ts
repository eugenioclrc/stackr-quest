import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

import * as ROT  from 'rot-js';

const WIDTH = 50, HEIGHT = 50;

function createMap() {
    function key(x, y) { return `${x},${y}`; }
    return {
        _values: {},
        has(x, y) { return this._values[key(x, y)] !== undefined; },
        get(x, y) { return this._values[key(x, y)]; },
        set(x, y, value) { this._values[key(x, y)] = value; },
    };
}


function createTileMap(dungeonLevel) {
    let tileMap = createMap();
    const digger = new ROT.Map.Digger(WIDTH, HEIGHT, {
        roomWidth: [6, 10],
        roomHeight: [6, 10],
        corridorLength: [1, 3],
    });
    digger.create((x, y, contents) =>
        tileMap.set(x, y, {
            walkable: contents === 0,
            wall: contents === 1,
            explored: false,
        })
    );
    tileMap.dungeonLevel = dungeonLevel;
    tileMap.rooms = digger.getRooms();
    tileMap.corridors = digger.getCorridors();

    // Put the player in the first room
    //let [playerX, playerY] = tileMap.rooms[0].getCenter();
    //moveEntityTo(player, {x: playerX, y: playerY});

    // Put stairs in the last room
    //let [stairX, stairY] = tileMap.rooms[tileMap.rooms.length-1].getCenter();
    //createEntity('stairs', {x: stairX, y: stairY});

    // Put monster and items in all the rooms
    //for (let room of tileMap.rooms) {
    //    populateRoom(room, dungeonLevel);
    //}

    //updateTileMapFov(tileMap);
    return tileMap;
}

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload ()
    {
     
    }

    map: Phaser.Tilemaps.Tilemap;

    create ()
    {
        const m = createTileMap();
        this.map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 200, height: 200 });
        window.e = this.map;
        var tileset = this.map.addTilesetImage('background', 'background', 16, 16, 1, 2);
        var t72 = this.map.addTilesetImage('t72', 't72', 16, 16, 0, 0);
        var t72_wall= this.map.addTilesetImage('t72_wall', 't72_wall', 16, 16, 0, 0);
        
        this.layer = this.map.createBlankLayer('Layer 1', tileset);
        
         // Fill with black tiles
         //this.layer.fill(20);
         //this.map.putTileAt(1, 0, 1);

         this.layer2 = this.map.createBlankLayer('Layer 2', t72);
         this.map.putTileAt(3, 2, 2, false, 'Layer 2');


         
         window.m = m;
        
            
        this.layer3 = this.map.createBlankLayer('Layer 3', t72_wall);
        const matrix = []

        for (let y = 0; y < HEIGHT; y++) {
            matrix[y] = [];

            for (let x = 0; x < WIDTH; x++) {
                let tile = m.get(x, y);
                if(tile.walkable){
                    matrix[y][x] = 1;
                } else {
                    matrix[y][x] = 0;
                }
            }
        }

       
        const _matrix =generarMapaTiles(matrix);

        for(let y = 0; y < HEIGHT; y++){
            for(let x = 0; x < WIDTH; x++){
                if(matrix[y][x] == 1){
                    let tiles = [
                        { index: 0, weight: 20 },
                        { index: 1, weight: 1 },
                        { index: 2, weight: 1 },
                        { index: 7, weight: 1 },
                        { index: 8, weight: 1 },
                        { index: 9, weight: 1 }
                    ]
                    this.map.weightedRandomize(tiles, x, y, 1, 1, 'Layer 2');
                }

                /*if(_matrix[y][x] == 2){
                    this.map.putTileAt(38, x, y-1, false, 'Layer 3');
                */
               if(
                 (_matrix[y][x] == 3 && _matrix[y+1] && _matrix[y+1][x] == 0) || 
                 (y > 0 && _matrix[y][x] == 2 && _matrix[y-1][x] == 0)
                ){
                    this.map.putTileAt(38, x, y, false, 'Layer 3');
                } else if(
                    (_matrix[y][x] == 5 && _matrix[y][x+ 1] == 0)
                ){
                    this.map.putTileAt(1    , x, y, false, 'Layer 2');
                    this.map.putTileAt(20, x, y, false, 'Layer 3');
                } else if (x > 0 && _matrix[y][x] == 4 && _matrix[y][x-1] == 0) {
                    this.map.putTileAt(1    , x, y, false, 'Layer 2');
                    this.map.putTileAt(35, x, y, false, 'Layer 3');
                } else if(_matrix[y][x] != 0 && _matrix[y][x] != 1){
                    
                    const tileSize = 16; // Tamaño de cada tile en píxeles

        
                    // Crear un rectángulo para representar el tile
                    const rect = this.add.rectangle(x * tileSize, y * tileSize, tileSize, tileSize, 0xcccccc);
                    rect.setOrigin(0);
                    rect.setStrokeStyle(1, 0x000000);
    
                    // Agregar el número del tile
                    const text = this.add.text(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2,_matrix[y][x], {
                        fontSize: '16px',
                        fill: '#000'
                    });
                    text.setOrigin(0.5);
    /*
                    // Agregar las coordenadas
                    const coords = this.add.text(x * tileSize + 5, y * tileSize + 5, `(${x},${y})`, {
                        fontSize: '10px',
                        fill: '#000'
                    });
                    coords.setOrigin(0);
                    */

                }
                
            }
        }

        this.camera = this.cameras.main;
         //his.camera.setBackgroundColor(0x00ff00);

         // Scroll to the player
        this.cam = this.cameras.main;
        this.cameras.main.setZoom(4);
        let [playerX, playerY] = m.rooms[0].getCenter();
        this.cameras.main.centerOn(playerX * 16, playerY * 16);


        this.cam.setBounds(0, 0, this.layer.width * this.layer.scaleX, this.layer.height * this.layer.scaleY);
        //this.cam.scrollX = this.player.x - this.cam.width * 0.5;
        //this.cam.scrollY = this.player.y - this.cam.height * 0.5;

        // this.background = this.add.image(512, 384, 'background');
        // this.background.setAlpha(0.5);

        // this.gameText = this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }

}

function determinarTile(mapa, x, y) {
    if (mapa[y][x] === 0) {
        // Si la celda actual es 0, determinamos qué tipo de pared o esquina es
        const arriba = y > 0 ? mapa[y-1][x] : 0;
        const abajo = y < mapa.length - 1 ? mapa[y+1][x] : 0;
        const izquierda = x > 0 ? mapa[y][x-1] : 0;
        const derecha = x < mapa[y].length - 1 ? mapa[y][x+1] : 0;

        // Paredes
        if (abajo === 1) return 2; // Pared norte
        if (arriba === 1) return 3; // Pared sur
        if (derecha === 1) return 4; // Pared oeste
        if (izquierda === 1) return 5; // Pared este

        // Esquinas
        if (derecha === 1 && abajo === 1) return 6; // Esquina noroeste
        if (izquierda === 1 && abajo === 1) return 7; // Esquina noreste
        if (derecha === 1 && arriba === 1) return 8; // Esquina suroeste
        if (izquierda === 1 && arriba === 1) return 9; // Esquina sureste

        return 0; // Vacío
    } else {
        // Si la celda es 1, es un piso
        return 1;
    }
}

function generarMapaTiles(mapaOriginal) {
    return mapaOriginal.map((fila, y) =>
        fila.map((celda, x) => determinarTile(mapaOriginal, x, y))
    );
}
