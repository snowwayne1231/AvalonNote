<template>
    <div class="grid-curtain" ref="curtain" v-touch:moving="movingHandler" :class="{end: gameEnd}">
        <div class="grid-profile" v-for="player in playersWithData" :key="player.id" :style="{'background-color': getRoleRationColor(player)}">
            <div class="profile-info display-inline-vertical" v-touch:swipe="onSwipeInfo(player.id, player.goodRatio)">
                <b v-if="player.id == game.leader && !gameEnd" class="show-leader btn-leader vertical-center" @click="onClickInfo(player)">W</b>
                <div v-if="player.name" class="name" @click="onClickProfile(player)" v-touch:longtap="onLongtapProfile" :class="{editor: game.editPlayerMode, editing: game.tmp_change_player && game.tmp_change_player.id == player.id}">
                    <span>{{player.name}}</span>
                    <span class="role-ratio">
                        <i class="ball good" v-if="player.good"></i>
                        <i class="ball bad" v-if="player.bad"></i>
                        <i class="ball both" v-if="player.both"></i>
                    </span>
                </div>
            </div>
            <div class="profile-tool" v-if="player.name && !gameEnd">
                <div class="tools" v-if="hasLeader">
                    <div class="vote" :class="{agree: player.isAgree}"
                        @click="onClickVote(player)"></div>
                    <div class="role" @click="onClickInfo(player)">i</div>
                </div>
                <div v-else>
                    <b class="btn btn-leader vertical-center" @click="onClickLeader(player)">W</b>
                </div>
            </div>
            <div class="final-choice" v-else-if="player.name && gameEnd" v-touch:start="onTouchStartRoleRoll(player.id)" v-touch:end="onTouchEndRoleRoll" v-touch:moving="onTouchMovingRoleRoll">
                <div class="exact-role" v-if="player.role >= 0">{{gameRoleMap[player.role].name}}</div>
                <div class="role-roll" :class="{open: openRoleRoll == player.id}" v-show="player.role < 0 || openRoleRoll == player.id">
                    <div :class="{active: activeRole == idx, good: role.good, bad: role.bad, both: role.both}"
                        v-for="(role, idx) in rollRoles"
                        :key="role.value"
                        :data-value="role.value"
                        :data-pid="player.id"
                        :data-idx="idx"
                        :style="getRoleStyle(role,idx)"
                    >{{role.name}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
import { STATIC } from 'src/vuex/modules/game';

export default {
    data() {
        return {
            openRoleRoll: -1,
            activeRole: -1,
        }
    },
    props: {
        players: Array,
        hasLeader: Boolean,
        clickInfo: Function,
        sendMission: Function,
    },
    computed: {
        ...mapState(['game']),
        ...mapGetters(['gameEnd', 'gameRoleMap']),
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
        rollRoles(self) {
            const goodAndBad = [
                {name: 'CITIZEN', value: STATIC.ROLE.CITIZEN},
                {name: 'MINIONS', value: STATIC.ROLE.MINIONS},
            ];
            const lancelot = self.game.heros.findIndex(e => e.value === STATIC.ROLE.LANCELOT) >= 0
                ? [
                    {name: 'LANCELOT', value: STATIC.ROLE.LANCELOT_GOOD},
                    {name: 'LANCELOT', value: STATIC.ROLE.LANCELOT_BAD},
                ]
                : [];
            return self.game.heros.filter(e => e.value != STATIC.ROLE.LANCELOT).concat(goodAndBad).concat(lancelot).map(e => {
                return {
                    good: e.value < 10,
                    bad: e.value >= 10,
                    name: e.name.substr(0, 4),
                    value: e.value,
                }
            }).sort((a,b) => a.value - b.value);
        }
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
        getRoleRationColor(player) {
            const ratio = player.goodRatio;
            const x2 = ratio *2;
            const opa = Math.min(Math.round(Math.abs(ratio - 50) / 10), 3);
            return `rgba(${200 - x2},${ratio},${x2 + 50}, 0.${opa})`;
        },
        getRoleStyle(role, idx) {
            // console.log('getRoleStyle', role);
            const divisor = idx / this.rollRoles.length;
            const radian = divisor * 2 * Math.PI;
            const rangeX = 25;
            const rangeY = 36;
            // const deg = Math.round(divisor * 360) + 90;
            
            return {
                transform: `translate(${Math.round(Math.cos(radian) * rangeX)}px, ${Math.round(Math.sin(radian) * rangeY)}px)`,
            };
        },
        onClickLeader(player) {
            // console.log('player', player);
            this.$store.dispatch('GAME_CHOOSE_LEADER', {
                idx: player.id,
            });
        },
        onClickProfile(player) {
            // console.log('player', player);

            if (this.gameEnd) {
                return this.onClickInfo(player, 1);
            }

            if (this.game.editPlayerMode) {
                return this.$store.dispatch('GAME_CHANGE_PLAYER_NAME', {
                    player,
                });
            }

            if (player.name.match(/player/i)) {

                const enter = window.prompt('Enter The Name You Wanna Change', '');

                if (enter == null) return;

                if (!enter) { return window.alert('Please Enter The Right Name'); }

                this.$store.dispatch('GAME_EDIT_PLAYER_NAME', {
                    idx: player.id,
                    name: enter,
                });
            } else {
                return this.onClickInfo(player);
            }

        },
        onClickVote(player) {
            this.$store.dispatch('GAME_TOGGLE_VOTE', {
                idx: player.id,
            });

            if (!player.isAgree) {
                this.sendMission(player.id);
            }
        },
        onClickInfo(player, watch) {
            if (this.clickInfo) {
                this.clickInfo.call(null, player, watch);
            }
        },
        movingHandler(evt) {
            // console.log('evt', evt);
            // evt.preventDefault();
            evt.stopPropagation();
            if (this.gameEnd) return;
            const touch = evt.touches[0];
            const ele = document.elementFromPoint(touch.clientX, touch.clientY);
            if (ele && ele.classList.contains('vote') && !ele.classList.contains('agree')) {
                // console.log('ele', [ele]);
                ele.click();
            }
        },
        onSwipeInfo(playey_id) {
            if (!playey_id) return {};
            return changeRatio.bind(this);

            function changeRatio(direction, evt) {
                let ratio = this.game.players[playey_id].goodRatio;
                ratio += direction=='left' ? 50 : -50;
                ratio = Math.min(Math.max(ratio, 0), 100);
                this.$store.dispatch('GAME_CHANGE_GOOD_RATIO', {
                    player_idx: playey_id,
                    value: ratio,
                });
            }
        },
        onTouchStartRoleRoll(player_id) {
            const self = this;
            return function(evt){
                self.openRoleRoll = player_id;
                self.activeRole = -1;
                self._tmpPlayerId = player_id;
            }
        },
        onTouchEndRoleRoll() {
            this.openRoleRoll = -1;
            this.activeRole = -1;
            
            const id = this._tmpPlayerId;
            const role = this._tmpRoleValue || STATIC.ROLE.CITIZEN;
            console.log('onTouchEndRoleRoll', id, role);

            this.$store.dispatch('GAME_SAVE_PLAYER_ROLE', {
                player_idx: id,
                role: role,
                isGood: role<10,
            })
        },
        onTouchMovingRoleRoll(evt) {
            const touch = evt.touches[0];
            const ele = document.elementFromPoint(touch.clientX, touch.clientY);
            if (!ele) return;

            const idx = ele.dataset.idx;
            if (idx) {
                this.activeRole = parseInt(idx, 10);
                this._tmpPlayerId = parseInt(ele.dataset.pid, 10);
                this._tmpRoleValue = parseInt(ele.dataset.value, 10);
            }
        },
        onLongtapProfile(evt) {
            if (!this.gameEnd) {
                this.$store.dispatch('GAME_TOGGLE_EDIT_PLAYER_MODE');
            }
        },
    },
}
</script>