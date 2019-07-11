<template>
    <div class="game-player-grid">
        
        <Curtain class="grid-left" :players="leftPlayers" :hasLeader="hasLeader" :clickInfo="onClickInfo" />
        
        <Curtain class="grid-right" :players="rightPlayers" :hasLeader="hasLeader" :clickInfo="onClickInfo" />

        <modal name="modal-info"
            class="game-modal" 
            :width="300"
            :height="540">
            <div class="header">{{playerInfo.name}}
                <i class="close" @click="onClickCloseModal">x</i>
            </div>
            <div class="tabs">
                <b class="tab-vote btn vertical-center" :class="{active: mywatch==1}" @click="onClickTab(1)">Voting</b>
                <b class="tab-possible btn vertical-center" :class="{active: mywatch==2}" @click="onClickTab(2)">Possible</b>
                <b class="tab-besend btn vertical-center" :class="{active: mywatch==3}" @click="onClickTab(3)">Be Send</b>
            </div>
            <div class="content" v-touch:swipe="swipeHandler">
                <div class="inner-content">
                    <div class="content-vote" v-if="mywatch==1">
                        <table>
                            <thead>
                                <tr>
                                    <th width="15%">R</th>
                                    <th width="85%">Track</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in playerInfo.votes" :key="item.round">
                                    <td :class="{win: item.win, lose: item.lose}">{{item.round}}</td>
                                    <td>
                                        <div class="vote-round" :class="{last: (idx + 1) == item.vote.length}" v-for="(vote, idx) in item.vote" :key="idx">
                                            <div class="vote-go-leader vertical-center" :class="{self: vote.leader == playerInfo.name}" @click="onClickPlayer(vote.leader)">{{vote.leader}}</div>
                                            <div class="vote-go-players">
                                                <p class="player" :class="{self: player == playerInfo.name, leader: player == vote.leader}" v-for="(player, pi) in vote.players" :key="pi" @click="onClickPlayer(player)">{{player}}</p>
                                            </div>
                                            <div class="vote-go-vote" :class="{in: vote.insideDisagree, out: vote.outsideAgree}">
                                                <span class="vote" :class="{agree: vote.agree}">
                                                    <span v-if="vote.insideDisagree">IN</span>
                                                    <span v-if="vote.outsideAgree">OT</span>
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="content-possible" v-if="mywatch==2">
                        <div class="role-possible">
                            <div v-for="role in rolePossibles"
                                :key="role.key"
                                @click="onClickRole(role)"
                                class="role"
                                :class="{good: role.good, bad: role.bad, both: role.both, possible: role.possible}"
                            >{{role.display}}</div>
                        </div>
                    </div>

                    <div class="content-besend" v-if="mywatch==3">
                        <div class="left">
                            <div class="player"
                                :class="{self: player.name === playerInfo.name}"
                                v-for="player in leftPlayers" 
                                :key="player.id">
                                <div class="name" @click="onClickPlayer(player.name)">{{player.name}}</div>
                                <div class="voting" v-if="playerInfo.beSendVoteCounting[player.id] && playerInfo.id != player.id">
                                    <div class="agree">
                                        <span class="circle">
                                            {{playerInfo.beSendVoteCounting[player.id].agree.total}}
                                        </span>
                                    </div>
                                    <div class="disagree">
                                        <span class="circle">
                                            {{playerInfo.beSendVoteCounting[player.id].disagree.total}}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="center">
                            <svg height="100%" width="100%">
                                
                                <g v-for="(send) in playerInfo.beSend" :key="`round_${send.round}`" :stroke="send.win ? 'blue' : 'red'" stroke-width="2">
                                    <g
                                        v-for="(opp, idx) in send.opportunities"
                                        v-show="opp.leader.id != playerInfo.id"
                                        :key="opp.leader.name + idx"
                                    >
                                        <line
                                            :x1="getSvgPlayerPoint('x', opp.leader)"
                                            :y1="getSvgPlayerPoint('y', opp.leader)"
                                            :x2="getRoundCirclePoint('x', send.round)"
                                            :y2="getRoundCirclePoint('y', send.round)"
                                            :style="{stroke: (idx + 1 < send.opportunities.length) ? 'gray' : null}"
                                        />
                                        <line
                                            :x1="getSvgPlayerPoint('x')"
                                            :y1="getSvgPlayerPoint('y')"
                                            :x2="getRoundCirclePoint('x', send.round)"
                                            :y2="getRoundCirclePoint('y', send.round)"
                                            :style="{stroke: (idx + 1 < send.opportunities.length) ? 'gray' : null}"
                                        />
                                    </g>
                                </g>

                                <g v-for="(res, idx) in game.results" :key="idx">
                                    <circle :cx="getRoundCirclePoint('x', idx + 1)" :cy="getRoundCirclePoint('y', idx + 1)" r="20" stroke="black" stroke-width="1" :fill="res == 1 ? 'blue' : ( res == 2 ? 'red' : 'gray')" />
                                </g>

                            </svg>
                        </div>
                        <div class="right">
                            <div class="player"
                                :class="{self: player.name === playerInfo.name}"
                                v-for="player in rightPlayers" 
                                :key="player.id">
                                <div class="name" @click="onClickPlayer(player.name)">{{player.name}}</div>
                                <div class="voting" v-if="playerInfo.beSendVoteCounting[player.id] && playerInfo.id != player.id">
                                    <div class="agree">
                                        <span class="circle">
                                            {{playerInfo.beSendVoteCounting[player.id].agree.total}}
                                        </span>
                                    </div>
                                    <div class="disagree">
                                        <span class="circle">
                                            {{playerInfo.beSendVoteCounting[player.id].disagree.total}}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
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
import {STATIC} from 'src/vuex/modules/game';

export default {
    data() {
        return {
            playerInfo: {
                id: -1,
                name: '',
                table: -1,
                isLeftTable: false,
                votes: [],
                beSend: [],
                beSendVoteCounting: [],
            },
            mywatch: 1,
            roleMap: {},
        };
    },
    computed: {
        ...mapState(['game']),
        playerGrid(self) {
            // const basic = {
            //     'besended': false,
            // };
            return self.game.tablePlayer.map((ele, idx) => {
                return !isNaN(ele) && self.game.players[ele]
                    ? {
                        table: idx,
                        // ...basic,
                        ...self.game.players[ele],
                    }
                    : {};
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
        rolePossibles(self) {
            const personalRole = self.game.role_possible[self.playerInfo.id];
            const heros = self.game.heros.map(e => e.value);

            return personalRole && Array.isArray(personalRole)
                ? Object.values(self.roleMap).filter(e => {
                    return heros.includes(e.value) || e.value === STATIC.ROLE.MINIONS || e.value === STATIC.ROLE.CITIZEN;
                }).map(e => {
                    const possible = personalRole.includes(e.value);
                    return {possible ,...e};
                })
                : []
        }
    },
    mounted() {
        console.log('Player grid', this);
        const nextRole = {};
        
        Object.keys(STATIC.ROLE).map(key => {
            const value = STATIC.ROLE[key];
            nextRole[value] = {
                value,
                key,
                display: key.substring(0, 1) + key.substring(1).toLowerCase(),
                good: value < 10,
                bad: value >= 10 && value <20,
                both: value>= 20,
            };
        });
        this.roleMap = nextRole;

    },
    methods: {
        onClickInfo(player, specifyWatch) {
            // console.log('player', player);
            if (specifyWatch) {
                this.mywatch = specifyWatch;
            }

            const player_idx = player.id;
            const playerMap = this.game.players;
            const player_info = {...playerMap[player_idx]};
            const result = this.game.results;

            
            const tracks = this.game.tracks;
            
            const votes = tracks.filter(ele => ele.opportunities[0].leader_idx >= 0).map((ele, idx) => {
                const filterOp = ele.opportunities.filter(e => e.leader_idx >= 0);
                return {
                    round: idx + 1,
                    win: result[idx] === STATIC.RESULT.SUCCESS,
                    lose: result[idx] === STATIC.RESULT.FAIL,
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

            const beSend = tracks.map((ele, idx) => {
                const filterOp = ele.opportunities.filter(e => e.leader_idx >= 0 && e.players.includes(player_idx));
                return filterOp.length == 0
                    ? { round: -1 }
                    : {
                        round: idx + 1,
                        win: result[idx] === STATIC.RESULT.SUCCESS,
                        lose: result[idx] === STATIC.RESULT.FAIL,
                        opportunities: filterOp.map(e => {
                            return {
                                leader: {id: e.leader_idx, name: playerMap[e.leader_idx].name},
                                players: e.players.map(p => {
                                    return {
                                        id: p,
                                        name: playerMap[p].name,
                                    }
                                }),
                                votes: e.votes.map((v, idx) => {
                                    return {
                                        agree: !!v,
                                        name: playerMap[idx].name,
                                    }
                                }),
                            };
                        }),
                    };
            }).filter(e => e.round > 0);

            const beSendVoteCounting = new Array(10).fill(0).map(e => {return {
                agree: {in:0, out:0, total:0},
                disagree: {in:0, out:0, total:0},
            }});
            beSend.map(b => {
                b.opportunities.map(o => {
                    const players = o.players.map(p => p.id);
                    o.votes.map((v,idx) => {
                        const count = beSendVoteCounting[idx];
                        const inOut = players.includes(idx) ? 'in' : 'out';
                        if (v.agree) {
                            count.agree[inOut]++;
                            count.agree.total++;
                        } else {
                            count.disagree[inOut]++;
                            count.disagree.total++;
                        }
                    });
                });
            });


            this.playerInfo.id = player_info.id;
            this.playerInfo.name = player_info.name;
            this.playerInfo.table = this.game.tablePlayer.findIndex(e => e == player_info.id);
            this.playerInfo.isLeftTable = this.playerInfo.table < 5;
            this.playerInfo.votes = votes;
            this.playerInfo.beSend = beSend;
            this.playerInfo.beSendVoteCounting = beSendVoteCounting;

            console.log(this.playerInfo);

            this.$modal.show('modal-info');
        },
        onClickTab(int) {
            // console.log(this);
            this.mywatch = parseInt(int,10);
        },
        onClickPlayer(name) {
            if (name === this.playerInfo.name) return;
            const player = this.game.players.find(e => e.name == name);
            // console.log('onClickPlayer', player, name);
            if (player) {
                this.$modal.hide('modal-info');
                
                window.setTimeout(() => {
                    this.onClickInfo(player);
                }, 100);
            }
        },
        onClickRole(role) {
            const player_idx = this.playerInfo.id;
            
            this.$store.dispatch('GAME_TOGGLE_ROLE_POSSIBLE', {
                player_idx,
                role: role.value,
            });
        },
        onClickCloseModal() {
            this.$modal.hide('modal-info');
        },
        swipeHandler(mode, evt) {
            // console.log(mode, evt);
            const int = mode == 'left'
                ? 1
                : mode == 'right'
                    ? -1
                    : 0;
            this.mywatch = ((this.mywatch + int) % 3) || 3;
        },
        getSvgPlayerPoint(xy = 'x', player = null) {
            const self = player == null || player.id == this.playerInfo.id;
            const table = self
                ? this.playerInfo.table
                : this.game.tablePlayer.findIndex(e => e == player.id);
            switch (xy) {
                case 'x':
                    return `${table < 5 ? 0 : 100}%`;
                default:
                    const top = (table % 5) * 20;
                    return `${top + 10}%`;
            }
        },
        getRoundCirclePoint(xy = 'x', round) {
            switch (xy) {
                case 'x':
                    return '50%';
                default:
                    return `${(round * 15)}%`;
            }
        },
    },
    components: {
        Curtain,
    },
}
</script>