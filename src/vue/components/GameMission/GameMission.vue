<template>
    <div class="mission-cards">
        <Draggable
            v-for="(item, idx) in missionCardItems"
            :key="idx"
            :list="item"
            :move="checkMove"
            class="card"
            :class="{isUnuse: idx > 9, isLeft: idx <= 9 && idx % 2 == 0, isRight: idx <= 9 && idx % 2 == 1}"
            :style="{left: idx > 9 ? `${((idx - 10) * 18) +4}%` : '0%'}"
            handle=".sended"
            group="mission-card">
            <b
                v-for="(i, iidx) in item"
                @click="onClickCard(idx)"
                :class="{sended: i.sended, disable: i.disable}"
                :key="iidx">
                <span v-if="i.sended">I</span>
                <p v-else class="round-sended" :class="{show: idx < 10 && item[0] && !item[0].disable}">
                    <i v-for="(res, ridx) in game.results" :key="ridx" :class="{blue: res == 1, red: res == 2, in: checkInResult(idx, ridx)}"></i>
                </p>
            </b>
        </Draggable>
    </div>
</template>

<script>
import './GameMission.scss';
import {mapState, mapGetters} from 'vuex';
import Draggable from 'vuedraggable';

export default {
    data() {
        return {
            missionCardItems: new Array(15).fill(0).map((ele, idx) => {
                return [{
                    sended: false,
                }];
            }),
            tableIndexMap: [0,5,1,6,2,7,3,8,4,9],
        };
    },
    computed: {
        ...mapState(['game']),
    },
    mounted() {
        
        this.startRound(this.game.round);
    },
    methods: {
        checkMove(evt) {
            // console.log('move', evt);
            const list = evt.relatedContext.list.filter(e => e.sended || e.disable);
            return list.length == 0;
        },
        checkInResult(cardidx, round) {
            const track = this.game.tracks[round];
            const table_idx = this.tableIndexMap[cardidx];
            const player_idx = this.game.tablePlayer[table_idx];
            return track && !isNaN(player_idx) && track.go_players.includes(player_idx);
        },
        onClickCard(idx) {
            const unuse = this.missionCardItems.slice(10);
            const idx_unuse = unuse.findIndex(e => e[0] && e[0].sended);
            if (idx_unuse>=0 && idx < 10) {
                const loc = this.missionCardItems[idx_unuse + 10][0];
                this.missionCardItems[idx_unuse + 10] = [];
                this.missionCardItems[idx].unshift(loc);
                this.missionCardItems = [...this.missionCardItems];
            }
            
        },
        startRound(round = 1) {
            const cardNum = this.game.mission[round - 1];
            const playerNum = this.game.playerNum;
            const overIdx = this.missionCardItems.length - 1 - cardNum;
            this.missionCardItems = this.missionCardItems.map((ele, idx) => {
                return playerNum > idx || idx > 9
                ? [{sended: idx > overIdx ? true : false}]
                : [{disable: true}];
            })
        },
        getPlayers() {
            const tableMap = this.tableIndexMap;
            const tablePlayer = this.game.tablePlayer;
            const palyers = [];
            
            
            this.missionCardItems.map((ele, idx) => {
                if (ele.filter(e => e.sended).length > 0) {
                    const table = tableMap[idx];
                    if (!isNaN(table)) {
                        const player_idx = tablePlayer[table];
                        palyers.push(player_idx);
                    }
                }
            });
            return palyers;
        },
    },
    components: {
        Draggable,
    },
}
</script>