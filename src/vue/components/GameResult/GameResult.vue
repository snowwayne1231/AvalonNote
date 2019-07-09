<template>
    <div class="game-result">
        <div class="game-result-meta-round">
            <div class="show-error" v-if="error">
                {{error}}
            </div>
            <div
                class="round"
                :class="{fail: res==STATIC.RESULT.FAIL, success: res==STATIC.RESULT.SUCCESS, active: (idx + 1) == game.round}"
                v-else
                v-for="(res, idx) in game.results"
                :key="idx">
                {{game.mission[idx]}}
            </div>
        </div>
        <div class="game-result-vote-track-round">
            <div class="track">
                <div class="round" :class="{done: track.leader_idx >= 0, undo: track.leader_idx < 0 }" v-for="(track, idx) in opportunities" :key="idx">
                    {{idx + 1}}
                </div>
            </div>
        </div>

        <div class="game-result-message" v-if="game.resultMessage">
            {{game.resultMessage}}
        </div>
    </div>
</template>

<script>
import './GameResult.scss';
import {mapState, mapGetters} from 'vuex';
import { STATIC } from 'src/vuex/modules/game';

export default {
    data() {
        return {
            STATIC,
        };
    },
    computed: {
        ...mapState(['game']),
        error(self) {
            switch (true) {
                case self.game.leader < 0:
                return "Hasn't Chosen Leader";
            }
            return false;
        },
        opportunities(self) {
            const round = self.game.round - 1;
            return self.game.tracks[round].opportunities;
        },
    },
    mounted() {
        
    },
    methods: {
        
        
    },
    components: {
        
    },
}
</script>