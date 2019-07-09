<template>
    <div class="grid-curtain">
        <div class="grid-profile" v-for="player in playersWithData" :key="player.id">
            <div class="profile-info display-inline-vertical" >
                <b v-if="player.id == game.leader" class="show-leader btn-leader vertical-center">W</b>
                <span @click="onClickProfile(player)">{{player.name}}</span>
            </div>
            <div class="profile-tool" v-if="player.name">
                <div class="tools" v-if="hasLeader">
                    <div class="vote" :class="{agree: player.isAgree}" @click="onClickVote(player)"></div>
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
                if(p.name) p.isAgree = self.isAgree(p);
                return p;
            });
        },
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
        onClickInfo(player) {
            if (this.clickInfo) {
                this.clickInfo.call(null, player);
            }
        },
    },
}
</script>