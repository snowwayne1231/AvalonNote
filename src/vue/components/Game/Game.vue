<template>
    <div id="game">

        <div class="game-forward" :class="{opening: game.opening}">
            <Setting ref="setting"/>
        </div>

        <div class="game-top">
            <PlayerGrid />
            <Mission ref="mission" v-if="game.leader >= 0" />
            <Result ref="result" />
        </div>

        <div class="game-bottom">
            <b class="btn btn-back vertical-center" @click="onClickHome">HOME</b>
            <b class="btn btn-empty vertical-center" ></b>
            <b class="btn btn-empty vertical-center" ></b>
            <b class="btn btn-empty vertical-center" ></b>
            <b class="btn btn-next vertical-center" @click="onClickNext" v-if="!gameEnd">NEXT</b>
            <b class="btn btn-next vertical-center" v-else></b>
        </div>

        <modal class="game-modal" name="modal-winorlose"
            :width="340"
            :height="400">
            <b class="btn btn-win vertical-center" @click="onClickModalWin">WIN</b>
            <b class="btn btn-lose vertical-center" @click="onClickModalLose">LOSE</b>
            <b class="btn btn-cancel vertical-center" @click="onClickModalCancel">CANCEL</b>
        </modal>
        
    </div>
</template>

<script>
import './Game.scss';
import {mapState, mapGetters} from 'vuex';
import {STATIC} from 'src/vuex/modules/game';
import PlayerGrid from 'src/vue/components/GamePlayerGrid/GamePlayerGrid';
import Mission from 'src/vue/components/GameMission/GameMission';
import Setting from 'src/vue/components/GameSetting/GameSetting';
import Result from 'src/vue/components/GameResult/GameResult';

export default {
    data() {
        return {
            
        };
    },
    computed: {
        ...mapState(['game']),
        ...mapGetters(['gameVotesNow', 'gameGoPlayerNum', 'gameEnd']),
    },
    mounted() {
        console.log('game.vue', this);
        console.log('GAME', this.game);
        // window.addEventListener('touchmove', function(evt) {
        //     evt.preventDefault();
        // });
    },
    methods: {
        onClickHome() {
            this.$store.dispatch('GAME_BACK');
        },
        onClickNext() {
            const votes = this.gameVotesNow;
            const half = Math.floor(votes.length / 2);
            const isOverHalf = votes.filter(e => e === STATIC.VOTE.AGREE).length > half;
            const sendingPlayers = this.$refs.mission.getPlayers();
            
            if (sendingPlayers.length != this.gameGoPlayerNum) {
                return window.alert('Wrong Player Sendding');
            }

            if (isOverHalf) {
                this.$modal.show('modal-winorlose');
            } else if (this.game.trackRoundNow < 5) {
                this.$store.dispatch('GAME_SAVE_OPPORTUNITIES', {
                    players: sendingPlayers,
                });
            }
        },
        onClickModalCancel() {
            this.$modal.hide('modal-winorlose');
        },
        onClickModalWin() {
            this.saveResult(true);
        },
        onClickModalLose() {
            this.saveResult(false);
        },
        saveResult(win) {
            this.$store.dispatch('GAME_SAVE_ROUND_RESULT', {
                win,
                go_players: this.$refs.mission.getPlayers(),
            }).then(() => {
                this.$refs.mission.startRound(this.game.round);
                this.$modal.hide('modal-winorlose');
            });
        },
    },
    components: {
        PlayerGrid,
        Mission,
        Setting,
        Result,
    },
}
</script>