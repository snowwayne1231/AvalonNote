<template>
    <div class="grid-curtain" ref="curtain" v-touch:moving="movingHandler">
        <div class="grid-profile" v-for="player in playersWithData" :key="player.id">
            <div class="profile-info display-inline-vertical" >
                <b v-if="player.id == game.leader" class="show-leader btn-leader vertical-center">W</b>
                <div v-if="player.name" class="name">
                    <span @click="onClickProfile(player)">{{player.name}}</span>
                    <span @click="onClickInfo(player, 2)">
                        <i class="ball good" v-if="player.good"></i>
                        <i class="ball bad" v-if="player.bad"></i>
                        <i class="ball both" v-if="player.both"></i>
                    </span>
                </div>
            </div>
            <div class="profile-tool" v-if="player.name">
                <div class="tools" v-if="hasLeader">
                    <div class="vote" :class="{agree: player.isAgree}"
                        v-if="gameEnd"
                        @click="onClickVote(player)"></div>
                    <div class="choice" v-else>
                    </div>
                    <div class="role" @click="onClickInfo(player)">i</div>
                </div>
                <div v-else>
                    <b class="btn btn-leader vertical-center" @click="onClickLeader(player)">W</b>
                </div>
                
            </div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import { STATIC } from 'src/vuex/modules/game';

export default {
    props: {
        players: Array,
        hasLeader: Boolean,
        clickInfo: Function,
    },
    computed: {
        ...mapState(['game']),
        opportunities(self) {
            const gameRound = self.game.round - 1;
            const trackRound = self.game.trackRoundNow - 1;
            const trackObject = self.game.tracks[gameRound];
            const opportunities = trackObject.opportunities[trackRound];
            // console.log('opportunities', opportunities);
            return opportunities;
        },
        thisRoundVotes(self) {
            return self.opportunities.votes;
            // self.votes[gameRound].track
        },
        playersWithData(self) {
            return self.players.map(p => {
                const possbile = self.game.role_possible[p.id];
                const marks = {};
                if (Array.isArray(possbile)) {
                    possbile.map(e => {
                        switch (true){
                            case e<10: marks['good'] = true; break;
                            case e>=10 && e<20: marks['bad'] = true; break;
                            case e>=20: marks['both'] = true; break;
                            default:
                        }
                    })
                }
                return p.name 
                ? {
                    isAgree: self.isAgree(p),
                    ...marks, 
                    ...p,
                }
                : p;
            });
        },
    },
    mounted() {
        const curtain = this.$refs.curtain;
        // console.log('curtain', curtain);
        
    },
    methods: {
        isAgree(player) {
            const vote = this.thisRoundVotes[player.id];
            // console.log('vote', vote, player);
            return vote === STATIC.VOTE.AGREE;
        },
        onClickLeader(player) {
            // console.log('player', player);
            this.$store.dispatch('GAME_CHOOSE_LEADER', {
                idx: player.id,
            });
        },
        onClickProfile(player) {
            // console.log('player', player);
            const enter = window.prompt('Enter The Name You Wanna Change', '');

            if (enter == null) return;

            if (!enter) { return window.alert('Please Enter The Right Name'); }

            this.$store.dispatch('GAME_EDIT_PLAYER_NAME', {
                idx: player.id,
                name: enter,
            });
            
        },
        onClickVote(player) {
            this.$store.dispatch('GAME_TOGGLE_VOTE', {
                idx: player.id,
            });
        },
        onClickInfo(player, watch) {
            if (this.clickInfo) {
                this.clickInfo.call(null, player, watch);
            }
        },
        movingHandler(evt) {
            // console.log('evt', evt);
            const touch = evt.touches[0];
            const ele = document.elementFromPoint(touch.clientX, touch.clientY);
            if (ele && ele.classList.contains('vote') && !ele.classList.contains('agree')) {
                // console.log('ele', [ele]);
                ele.click();
            }
        },
    },
}
</script>