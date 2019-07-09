<template>
    <!-- App -->
    <div id="main-app">
        <Game>

        </Game>
    </div>
</template>

<script>

import Game from './components/Game/Game';

export default {
    data() {
        return {
            msg: 'WEIOWQE',
        }
    },
    mounted() {
        console.log('main.vue', this);
    },
    components: {Game},
}
</script>