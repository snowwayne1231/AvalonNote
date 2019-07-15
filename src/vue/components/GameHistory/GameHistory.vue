<template>
    <div class="game-history" v-touch:swipe="onSwipe">
        <table>
            <thead>
                <tr>
                    <th>Player</th>
                    <th>Win</th>
                    <th>Lose</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="player in playersRecord" :key="player.name">
                    <td>{{player.name}}</td>
                    <td>{{player.total.win}}</td>
                    <td>{{player.total.lose}}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import './GameHistory.scss';
import {mapState, mapGetters} from 'vuex';
import { STATIC } from 'src/vuex/modules/game';

export default {
    props: {
        close: Function,
    },
    data() {
        return {
            filter: [],
        };
    },
    computed: {
        ...mapState(['game']),
        histories(self) {
            return JSON.parse(window.localStorage.getItem(STATIC.LOCALHISTORY) || []);
        },
        playersRecord(self) {
            const player = {};

            self.histories.map(state => {

                state.players.map(p => {
                    const name = p.name;
                    const role = p.role;
                    if (!player[name]) {
                        player[name] = basicPlayerRecord(name);
                    }

                    const loc_player = player[name];
                    const win = role < 10 ? state.resultsFinal === STATIC.RESULT.SUCCESS : state.resultsFinal === STATIC.RESULT.FAIL;

                    loc_player.games.push({
                        timestamp: state.timestamp,
                        role,
                        win,
                    });

                    if (win) {
                        loc_player.total.win++;
                    } else {
                        loc_player.total.lose++;
                    }
                });

            });

            
            return Object.values(player).sort((a,b) => b.total.win - a.total.win);

            function basicPlayerRecord(name) {
                return {
                    name,
                    games: [
                        // {
                        //     timestamp: new Date().getTime(),
                        //     role: -1,
                        //     win: true | false,
                        // }
                    ],
                    total: {
                        win: 0,
                        lose: 0,
                    }
                };
            }
        },
    },
    mounted() {
        console.log('History mounted', this);
    },
    methods: {
        onSwipe(direction, evt) {
            
            if (direction == 'right') {
                this.close.call(this, this);
            }
        },
    },
    components: {
        
    },
}
</script>