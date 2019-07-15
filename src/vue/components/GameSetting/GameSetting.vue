<template>
    <div class="game-setting" :class="{'close': game.opening}">
        <div class="setting-step-1" :class="{close: mode != 0}">
            <b class="btn vertical-center" @click="onClickNext">Start New Game</b>
            <b class="btn vertical-center" :class="{disable: !preJSON}" @click="onClickLoading">Loading Previous Game</b>
            <b class="btn vertical-center" :class="{disable: game.heros.length == 0}" @click="onClickReturn">Return To Game</b>
            <b class="btn vertical-center" :class="{disable: !preJSON}" @click="onClickHistory">Histories</b>

            <div class="setting-backup" @click="onClickOutputFile">Backup</div>
        </div>
        <div class="setting-step-2" v-show="mode == 1">
            <table>
                <tbody>
                    <tr>
                        <td>Player</td>
                        <td><input type="number" min="5" max="10" v-model.number="player" :class="{disable: !isPlayerInRange}" /></td>
                    </tr>
                    <tr>
                        <td>Order</td>
                        <td>
                            <select
                                v-model="game_order"
                            >
                                <option
                                    v-for="option in game_order_options"
                                    :value="option.value"
                                    :key="option.value">
                                    {{option.display}}
                                </option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Heros</td>
                        <td>
                            <Multiselect
                                v-model="role_selected"
                                label="display"
                                track-by="value"
                                :multiple="true"
                                @input="onChange"
                                :close-on-select="false"
                                :clear-on-select="false"
                                :options="role_options">
                                <template slot="tag" slot-scope="props">
                                    <span class="multiselect__tag" :class="{blue: props.option.isGood, lance: props.option.isLance}">{{ props.option.display }}</span>
                                </template>
                                <template slot="option" slot-scope="props">
                                    <div class="option__desc" :class="{blue: props.option.isGood, lance: props.option.isLance}">
                                        <span class="option__title">{{ props.option.display }}</span>
                                    </div>
                                </template>
                            </Multiselect>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2"><b class="btn btn-start" @click="onClickStart">START</b></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="setting-history" v-if="mode === 9">
            <GameHistory :close="onCloseHistory" />
        </div>
    </div>
</template>

<script>
import './GameSetting.scss';
import {mapState, mapGetters} from 'vuex';
import Multiselect from 'vue-multiselect';
import GameHistory from 'src/vue/components/GameHistory/GameHistory';
import { STATIC } from 'src/vuex/modules/game';

export default {
    data() {
        return {
            mode: 0,
            preJSON: null,
            player: 5,
            game_order: -1,
            game_order_options: [{display: 'Clockwise', value: 1}, {display: 'CounterClockwise', value: -1}],
            role_selected: null,
            role_options: [],
        };
    },
    computed: {
        ...mapState(['game']),
        isPlayerInRange(self) {
            return self.player <= 10 && self.player >= 5;
        },
    },
    mounted() {
        this.preJSON = !!localStorage.getItem(STATIC.LOCALSTORAGE);

        this.role_options = Object.keys(STATIC.ROLE)
        .filter(key => key != 'CITIZEN' && key != 'MINIONS' && !key.match('LANCELOT_'))
        .map(key => {
            return {display: key, value: STATIC.ROLE[key], isGood: STATIC.ROLE[key] < 10, isLance: STATIC.ROLE[key] >= 20};
        });

        this.role_selected = this.role_options.filter(ele => {
            return ['MERLIN', 'PERCIVAL', 'MORGANA', 'ASSASSIN'].includes(ele.display);
        });

        // console.log('STATIC', STATIC);
        // console.log('role_options', this.role_options);
    },
    methods: {
        onClickNext() {
            this.mode = 1;
        },
        onChange(evt) {
            // console.log('evt', evt);
            // console.log('role_selected', this.role_selected);
        },
        ifBadGuyOverCount() {
            const gameplayer = STATIC.WORLD.GAMEPLAYER[this.player];
            // console.log('gameplayer', gameplayer);
            if (gameplayer) {
                const ruleBadGuyNum = gameplayer[1];
                const badGuyNum = this.role_selected.filter(ele => {
                    return ele.value >= 10;
                }).length;
                return badGuyNum > ruleBadGuyNum;
            }
            
            return true;
        },
        onClickStart() {
            if (!this.isPlayerInRange) {
                return window.alert('Wrong Player Number');
            }

            if (this.ifBadGuyOverCount()) {
                return window.alert('Too Many Bad Guy');
            }

            this.$store.dispatch('GAME_INIT', {
                player: this.player,
                order: this.game_order,
                heros: this.role_selected.map(ele => {
                    return {name: ele.display, value: ele.value};
                }),
            }).then(e => {
                this.mode = 0;
            });
        },
        onClickLoading() {
            if (!this.preJSON) return;

            this.$store.dispatch('GAME_LOAD').then(e => {
                this.mode = 0;
            });
        },
        onClickReturn() {
            this.$store.dispatch('GAME_RESTART');
        },
        onClickHistory() {
            this.mode = 9;
        },
        onCloseHistory() {
            this.mode = 0;
        },
        onClickOutputFile() {
            const a = document.createElement("a");
            const histories = window.localStorage.getItem(STATIC.LOCALHISTORY);
            const file = new Blob([histories], {type: 'text/plain'});
            a.href = URL.createObjectURL(file);
            a.download = `avalon_state_backup_${new Date().getTime()}`;
            a.click();
        },
    },
    components: {
        Multiselect,
        GameHistory,
    },
}
</script>