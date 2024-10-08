import ROT from 'rot-js';

import { Corridor, Room } from 'rot-js/lib/map/features';
import { Entity, Counters, ENTITY_TYPE, newEntity } from './state';

import {randomBytes} from 'node:crypto';

const WIDTH = 50;
const HEIGHT = 44;

type Tile = { walkable: boolean; wall: boolean; explored: boolean; }

type MapType = {
    level: any;
    rooms: Room[]; // Update the type of rooms to Room[]
    corridors: Corridor[];
    tiles: {[key: string]: Tile};
    set(x: number, y: number, tile: Tile): void;
    get(x: number, y: number): Tile;
};


/** like python's randint */
const randint = ROT.RNG.getUniformInt.bind(ROT.RNG);

export function movePlayer(state: Counters, dx: number, dy: number) {
    ROT.RNG.setSeed(Number(state.currentseed));
    // update random seed... probable not a good idea if this has to run deterministicly
    state.currentseed = randomBytes(32).toString('hex');

    const player = state.entities.find((v) => {
        return (v.type === 'PLAYER');
    });

    if(!player) {
        throw new Error('Player not found');
    }

    const x = player.x + dx;
    const y = player.y + dy;

    const map = createMap(state);

    if (!map.get(x, y).walkable) {
        return; // @q: should we throw an error here?
    }
    let target = entityAt(state, x, y);
    if (target && target.id !== player.id) {
        attack(player, target);
    } else {
        player.x = x;
        player.y = y;
    }
    // enemiesMove();
}

function attack(attacker: Entity, defender: Entity) {
    let damage = (attacker.effective_power || 0) - (defender.effective_defense || 0);
    let color = attacker.id === player.id? 'player-attack' : 'enemy-attack';
    if (damage > 0) {
        //print(`${attacker.name} attacks ${defender.name} for ${damage} hit points.`, color);
        takeDamage(attacker, defender, damage);
    } else {
        //print(`${attacker.name} attacks ${defender.name} but does no damage.`, color);
    }
}


function takeDamage(source: Entity, target: Entity, amount: number) {
    target.hp -= amount;
    if (target.hp <= 0) {
        //print(`${target.name} dies!`, target.id === player.id? 'player-die' : 'enemy-die');
        if (target.xp_award !== undefined) { gainXp(source, target.xp_award); }
        target.dead = true;
    }
}


function xpForLevel(level: number) {
    return 200 * level + 150 * (level * (level+1)) / 2;
}

function gainXp(entity: Entity, amount: number) {
    if (entity.xp === undefined) { return; } // this entity doesn't gain experience
    entity.xp += amount;
    if (entity.type !== ENTITY_TYPE.PLAYER) { throw `XP for non-player not implemented`; }
    print(`You gain ${amount} experience points.`, 'info');
    while (entity.xp > xpForLevel(entity.level || 0)) {
        entity.level =(entity.level ||0) + 1;
        //print(`Your battle skills grow stronger! You reached level ${entity.level}! +20 hp`, 'warning');
        // @todo, know it only update hp
        player.base_max_hp = (player.base_max_hp || 0) + 20;
        player.hp += 20;
        //upgradeOverlay.open();
    }
}

function createPlayer(state: Counters, ids: {i: number}) {
    const player: Entity = newEntity(
        ids.i++,
        ENTITY_TYPE.PLAYER,
        0,
        0,
        JSON.stringify({
            base_max_hp: 100,
            base_defense: 1,
            base_power: 4,
            xp: 0,
            level: 1,
            inventory: [],
            equipment: [],
        })
    );
    return player;
}

export function createMap(state: Counters) {
    ROT.RNG.setSeed(Number(state.genseed));
    const ids = {i: 0};
    const _map: MapType = {
        level: state.level,
        rooms: [], // Initialize rooms as an empty array
        corridors: [],
        tiles: {},
        set(x: number, y: number, tile: Tile) {
            this.tiles[`${x},${y}`] = tile;
        },
        get(x: number, y: number) {
            return this.tiles[`${x},${y}`];
        },
    };

    const digger = new ROT.Map.Digger(WIDTH, HEIGHT);
    digger.create((x, y, contents) =>
        _map.set(x, y, {
            walkable: contents === 0,
            wall: contents === 1,
            explored: false,
        })
    );
    _map.level = state.level;
    _map.rooms = digger.getRooms();
    _map.corridors = digger.getCorridors();


    if(state.entities.length === 0) {
        let player = state.entities.find((v) => {
            return (v.type === 'PLAYER');
        }) || createPlayer(state, ids);
        

        // Put the player in the first room
        let [playerX, playerY] = _map.rooms[0].getCenter();
        player.x = playerX;
        player.y = playerY;
        state.entities.push(player);

        // Put stairs in the last room
        let [stairX, stairY] = _map.rooms[_map.rooms.length-1].getCenter();
        
        state.entities.push(newEntity(
            ids.i++,
            ENTITY_TYPE.STAIRS,
            stairX,
            stairY,
            ''
        ));

        // Put monster and items in all the rooms
        for (let room of _map.rooms) {
            populateRoom(_map, room, state, ids);
        }
    }

    return _map;
}

function populateRoom(map: MapType, room: Room, state: Counters, ids: {i: number}) {
    //let numMonsters = Math.floor(ROT.RNG.getUniform() * 3) + 1;
    //let numItems = Math.floor(ROT.RNG.getUniform() * 2);

    let maxMonstersPerRoom = evaluateStepFunction([[1, 2], [4, 3], [6, 5]], state.level),
            maxItemsPerRoom = evaluateStepFunction([[1, 1], [4, 2]], state.level);

        // for now always move to player
        //const ai = {behavior: 'move_to_player'};
        const monsterChances = {
            ORC: 80,
            //troll: evaluateStepFunction([[3, 15], [5, 30], [7, 60]], state.level),
        };
        const monsterProps: {[key: string]: { props: any; type: ENTITY_TYPE; }} = {
            ORC: {
                props:{
                    base_max_hp: 20,
                    hp: 20, 
                    base_defense: 0, base_power: 4 // , ai
                },
                type: ENTITY_TYPE.ORC
            }
            //troll: {base_max_hp: 30, base_defense: 2, base_power: 8, ai},
        };
        
        const numMonsters = randint(0, maxMonstersPerRoom);
        for (let i = 0; i < numMonsters; i++) {
            let x = randint(room.getLeft(), room.getRight()),
                y = randint(room.getTop(), room.getBottom());
            if (!state.entities.find(e => e.x === x && e.y === y)) {
                let type = ROT.RNG.getWeightedValue(monsterChances);
                if(type && monsterProps[type]) {
                    state.entities.push(newEntity(
                        ids.i++,
                        monsterProps[type].type,
                        x,
                        y,
                        JSON.stringify(monsterProps[type].props)
                    ));
                }   
            }
        }

        /*
        const itemChances = {
            'healing potion': 70,
            'lightning scroll': 0,// evaluateStepFunction([[4, 25]], state.level),
            'fireball scroll':  0,//evaluateStepFunction([[6, 25]], state.level),
            'confusion scroll':  0,//evaluateStepFunction([[2, 10]], state.level),
            sword:  0,//evaluateStepFunction([[4, 5]], state.level),
            shield:  0,//evaluateStepFunction([[8, 15]], state.level),
        };

        const numItems = randint(0, maxItemsPerRoom);
        for (let i = 0; i < numItems; i++) {
            let x = randint(room.getLeft(), room.getRight()),
                y = randint(room.getTop(), room.getBottom());
            if (allEntitiesAt(x, y).length === 0) {
                createEntity(ROT.RNG.getWeightedValue(itemChances), {x, y});
            }
        }
            */
}

function entityAt(state: Counters, x: number, y: number) {
    return state.entities.find(e => e.x === x && e.y === y);
}

/** return a blocking entity at (x,y) or null if there isn't one * /
function blockingEntityAt(map, x: number, y: number) {
    let entities = map.tiles
        .filter(e => e.x == x && e.y == y)
        .filter(e => e.blocks);
    if (entities.length > 1) throw `invalid: more than one blocking entity at ${x},${y}`;
    return entities[0] || null;
}
*/

 /** step function: given a sorted table [[x, y], …] 
     and an input x1, return the y1 for the first x that is <x1 */
 function evaluateStepFunction(table: any[], x: number) {
     let candidates = table.filter(xy => x >= xy[0]);
     return candidates.length > 0 ? candidates[candidates.length-1][1] : 0;
 }

/*
    /** move an entity to a new location:
     *   {x:int y:int} on the map
     *   {carried_by_by:id slot:int} in id's 'inventory' 
     *   {equipped_by:id slot:int} is a valid location but NOT allowed here
     * /
    function moveEntityTo(entity: Entity, location: {x: number, y: number} | {carried_by: string, slot: number}) {
        if (entity.location.carried_by !== undefined) {
            let {carried_by, slot} = entity.location;
            let carrier = entities.get(carried_by);
            if (carrier.inventory[slot] !== entity.id) throw `invalid: inventory slot ${slot} contains ${carrier.inventory[slot]} but should contain ${entity.id}`;
            carrier.inventory[slot] = null;
        }
        entity.location = location;
        if (entity.location.carried_by !== undefined) {
            let {carried_by, slot} = entity.location;
            let carrier = entities.get(carried_by);
            if (carrier.inventory === undefined) throw `invalid: moving to an entity without inventory`;
            if (carrier.inventory[slot] !== null) throw `invalid: inventory already contains an item ${carrier.inventory[slot]} in slot ${slot}`;
            carrier.inventory[slot] = entity.id;
        }
    }
    */