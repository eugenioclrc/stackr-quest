import { Scene } from 'phaser';

import { getInfo, getWorld, submitAction, createWorld } from '../actions.ts';
//import { signMessage } from '../utils.ts';
//import { UpdateCounterSchema } from '../../../../minirollup/src/stackr/schemas';

export class Boot extends Scene
{
    active = true;
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', '/tileset.png');
        this.load.image('t72', '/0x72_DungeonTilesetII_v1.7/atlas_floor-16x16.png');
        this.load.image('t72_wall', '/0x72_DungeonTilesetII_v1.7/atlas_walls_low-16x16.png');
    }

    async create ()
    {
        // useful for signatures
        // @todo generate signature here !!
        /*
        window.signData = await getInfo();
        const value = {
            timestamp: Date.now(),
        };

        const signature = await window.w._signTypedData(window.signData.domain, window.signData.schemas['update-counter'].types['update-counter'], value);
        */
        const _state = await getWorld(window.w.address);
        if (JSON.stringify(_state) == '{}') {
            // create world
            createWorld(window.w.address);
            /*

            await signMessage(wallet, UpdateCounterSchema, inputs);
              const signature = await signMessage(wallet, UpdateCounterSchema, inputs);
              
            await submitAction('create', { msgSender: wallet.address, signature, inputs});
            */
        }
        this.scene.start('Game');


        // Definir el tipo de datos y los valores a firmar
const domain = {
    name: "MyApp",
    version: "1.0",
    chainId: 1, // Mainnet
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
};

const types = {
    Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" }
    ],
    Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" }
    ]
};

const value = {
    from: {
        name: "Alice",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"
    },
    to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"
    },
    contents: "Hello, Bob!"
};

// Crear la firma usando un objeto wallet
async function signMessage() {

    const signature = await wallet._signTypedData(window.signData, window.signData.schemas['update-counter'].types['update-counter'], value);

    console.log("Firma:", signature);
}

signMessage();

        */
    }
}

