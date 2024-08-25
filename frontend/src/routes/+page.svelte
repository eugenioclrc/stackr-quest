<script>
	import Game from "$lib/Game.svelte";
    import { onMount } from "svelte";
    import { Wallet } from "ethers"; 

    let wallet = undefined;
    onMount(() => {
        let pkey =window.localStorage.getItem('wallet')
        if(!pkey){
            wallet = Wallet.createRandom();
            window.localStorage.setItem('wallet', wallet.privateKey);
        } else {
            wallet = new Wallet(pkey);
        }

        // lol dont do any of this on a real project please, this is just to make it before hackaton ends
        window.w = wallet;
    });

</script>
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#if wallet != undefined}
    <p>{wallet.address}</p>
    <Game />
{/if}
