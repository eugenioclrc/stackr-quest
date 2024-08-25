<script context="module" lang="ts">

    import type { Game, Scene } from "phaser";

    export type TPhaserRef = {
        game: Game | null,
        scene: Scene | null
    };

</script>

<script lang="ts">

    import { onMount } from "svelte";
    import StartGame from "./index";
    import { EventBus } from './EventBus';

    export let phaserRef: TPhaserRef = {
        game: null,
        scene: null
    };


    onMount(() => {

        phaserRef.game = StartGame("game-container");

        EventBus.on('current-scene-ready', (scene_instance: Scene) => {

            phaserRef.scene = scene_instance;

            /*
            if(currentActiveScene)
            {
                
                currentActiveScene(scene_instance);
                
            }
                */

        });
        

    });

</script>

<div id="game-container"></div>