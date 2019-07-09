<template>
    <div class="game-player-grid">
        
        <Curtain class="grid-left" :players="leftPlayers" :hasLeader="hasLeader" :clickInfo="onClickInfo" />
        
        <Curtain class="grid-right" :players="rightPlayers" :hasLeader="hasLeader" :clickInfo="onClickInfo" />

        <modal name="modal-info"
            class="game-modal" 
            :width="300"
            :height="540">
            <div class="header">{{playerInfo.name}}</div>
            <div class="tabs">
                <b class="tab-vote btn vertical-center">Vote</b>
                <b class="tab-possible btn vertical-center">Possible</b>
            </div>
            <div class="content">
                <div class="inner-content">
                    <div class="content-vote">
                        <table>
                            <tbody>
                                <tr v-for="item in playerInfo.votes" :key="item.round">
                                    <td>{{item.round}}</td>
                                    <td>{{item.vote}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </modal>
    </div>
</template>

<script>
import './GamePlayerGrid.scss';
import {mapState, mapGetters} from 'vuex';
import Curtain from './_GridCurtain';

export default {
    data() {
        return {
            playerInfo: {
                name: '',
                votes: [],
            }
        };
    },
    computed: {
        ...mapState(['game']),
        playerGrid(self) {
            const basic = {
                'besended': false,
            };
            return self.game.tablePlayer.map((ele, idx) => {
                return !isNaN(ele) && self.game.players[ele]
                    ? {
                        table: idx,
                        id: ele,
                        ...basic,
                        ...self.game.players[ele],
                    }
                    : basic;
            });
        },
        leftPlayers(self) {
            
            return self.playerGrid.filter((ele, idx) => idx < 5);
        },
        rightPlayers(self) {
            
            return self.playerGrid.filter((ele, idx) => idx >= 5);
        },
        hasLeader(self) {
            return self.game.leader >= 0;
        },
    },
    mounted() {
        console.log('Player grid', this);

    },
    methods: {
        onClickInfo(player) {
            // console.log('player', player);
            const player_idx = player.id;
            const playerMap = this.game.players;
            const player_info = {...playerMap[player_idx]};

            
            
            const tracks = this.game.tracks;
            const votes = tracks.filter(ele => ele.opportunities[0].leader_idx >= 0).map((ele, idx) => {
                const filterOp = ele.opportunities.filter(e => e.leader_idx >= 0);
                return {
                    round: idx + 1,
                    go_leader: ele.go_leader_idx >= 0 ? playerMap[ele.go_leader_idx].name : '',
                    go_track_round: ele.go_round,
                    go_players: ele.go_players.map(p => playerMap[p].name),
                    vote: filterOp.map(e => {
                        const agree = !!e.votes[player_idx];
                        const included = e.players.includes(player_idx);
                        return {
                            leader: playerMap[e.leader_idx].name,
                            players: e.players.map(p => playerMap[p].name),
                            agree,
                            outsideAgree: agree && !included,
                            insideDisagree: !agree && included,
                        }
                    }),
                }
            });


            player_info.votes = votes;

            console.log('player_info', player_info);

            this.playerInfo = player_info;

            this.$modal.show('modal-info');
        },
        
    },
    components: {
        Curtain,
    },
}
</script>