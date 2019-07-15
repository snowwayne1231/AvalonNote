import { createContext } from "vm";

export const STATIC = {
    RESULT: {
        UNDO: 0,
        SUCCESS: 1,
        FAIL: 2,
    },
    VOTE: {
        DISAGREE: 0,
        AGREE: 1,
    },
    ROLE: {
        CITIZEN: 0,
        MERLIN: 1,
        PERCIVAL: 2,
        LANCELOT_GOOD: 9,
        MINIONS: 10,
        MORDRED: 11,
        ASSASSIN: 12,
        MORGANA: 13,
        OBERON: 14,
        LANCELOT_BAD: 19,
        LANCELOT: 20,
    },
    WORLD: {
        GAMEPLAYER: {
            '5': [3, 2],
            '6': [4, 2],
            '7': [4, 3],
            '8': [5, 3],
            '9': [6, 3],
            '10': [6, 4],
        },
        MISSION: {
            '5': [2, 3, 2, 3, 3],
            '6': [2, 3, 4, 3, 4],
            '7': [2, 3, 3, 4, 4],
            '8': [3, 4, 4, 5, 5],
            '9': [3, 4, 4, 5, 5],
            '10': [3, 4, 4, 5, 5],
        },
    },
    LOCALSTORAGE: 'game_state',
    LOCALHISTORY: 'game_state_history',
};

const model = {
    state: {
        stage: STATIC.WORLD.GAMEPLAYER['5'],
        mission: STATIC.WORLD.MISSION['5'],
        round: 1,
        playerNum: 5,
        players: new Array(5).fill(0).map((ele, idx) => { return basicPlayer(idx); }),
        tablePlayer: new Array(10).fill(null),
        results: new Array(5).fill(STATIC.RESULT.UNDO),
        resultsFinal: STATIC.RESULT.UNDO,
        resultsAssassinated: false,
        resultMessage: null,
        trackRoundNow: 1,
        tracks: new Array(5).fill(0).map((ele, idx) => {
            return {
                go_round: -1,
                go_players: [],
                go_leader_idx: -1,
                opportunities: new Array(5).fill(0).map((e, i) => {
                    return {
                        leader_idx: -1,
                        players: [],
                        votes: [],
                    };
                }),
            };
        }),
        heros: [],
        leader: -1,
        opening: false,
        order: -1,
        role_possible: new Array(5).fill(0).map(e => []),
        timestamp: new Date().getTime(),
        editPlayerMode: false,
        tmp_change_player: null,
        // Lady of the Lake
    },
    getters: {
        'gameVotesNow': state => {
            return state.tracks[state.round - 1].opportunities[state.trackRoundNow - 1].votes;
        },
        'gameTracksNow': state => {
            return state.tracks[state.round - 1];
        },
        'gameGoPlayerNum': state => {
            return state.mission[state.round - 1];
        },
        'gameEnd': state => {
            return state.resultsFinal != STATIC.RESULT.UNDO;
        },
        'gameRoleMap': state => {
            const obj = {};
            Object.keys(STATIC.ROLE).map(key => {
                const value = STATIC.ROLE[key];
                obj[value] = {
                    value,
                    name: key,
                };
            });
            return obj;
        },
    },
    actions: {
        'GAME_INIT': (cxt, {player, heros, order}) => {
            const stage = STATIC.WORLD.GAMEPLAYER[player];
            if (stage) {
                const tablePlayer =  new Array(10).fill(null);
                const halfp = player / 2;
                let p = 0;

                for (let i = 0; i < Math.ceil(halfp); i++) {
                    tablePlayer[i] = p;
                    p++;
                }

                for (let j = 4 + Math.floor(halfp); j > 4; j--) {
                    tablePlayer[j] = p;
                    p++;
                    if (p >= player) {break;}
                }

                const originPlayers = cxt.state.players;

                cxt.commit('GAME:UPDATE', {
                    stage,
                    mission: STATIC.WORLD.MISSION[player],
                    heros,
                    round: 1,
                    playerNum: player,
                    players: new Array(player).fill(0).map((ele, idx) => {
                        const player = basicPlayer(idx);
                        if (originPlayers[idx]) {
                            player.name = originPlayers[idx].name;
                        }
                        return player;
                    }),
                    tablePlayer,
                    results: new Array(5).fill(STATIC.RESULT.UNDO),
                    resultsFinal: STATIC.RESULT.UNDO,
                    resultsAssassinated: false,
                    resultMessage: null,
                    trackRoundNow: 1,
                    tracks: new Array(5).fill(0).map((ele, idx) => {
                        return {
                            go_round: -1,
                            go_players: [],
                            go_leader_idx: -1,
                            opportunities: new Array(5).fill(0).map((e, i) => {
                                return {
                                    leader_idx: -1,
                                    players: [],
                                    votes: new Array(player).fill(STATIC.VOTE.DISAGREE),
                                };
                            }),
                        };
                    }),
                    leader: -1,
                    opening: true,
                    order,
                    role_possible: new Array(player).fill(0).map(e => []),
                    timestamp: new Date().getTime(),
                    editPlayerMode: false,
                    tmp_change_player: null,
                });
            } else {
                throw (`GAME_INIT ::: Can Not Specify Player Number As ${player}`);
            }
        },
        'GAME_BACK': (cxt) => {
            cxt.dispatch('GAME_SAVE_TO_LOCAL');
            cxt.commit('GAME:UPDATE', {
                opening: false,
            });
        },
        'GAME_RESTART': (cxt) => {
            cxt.commit('GAME:UPDATE', {
                opening: true,
            });
        },
        'GAME_LOAD': (cxt) => {
            const json = JSON.parse(window.localStorage.getItem(STATIC.LOCALSTORAGE));
            // json.timestamp = new Date().getTime();
            console.log('GAME_LOADING', json);
            cxt.commit('GAME:UPDATE', json);
        },
        'GAME_CHOOSE_LEADER': (cxt, {idx}) => {
            cxt.commit('GAME:UPDATE', {
                leader: idx,
            });
        },
        'GAME_EDIT_PLAYER_NAME': (cxt, {idx, name}) => {
            const nextPlayer = cxt.state.players;
            nextPlayer[idx].name = name.trim();
            cxt.commit('GAME:UPDATE', {
                players: nextPlayer,
            });
        },
        'GAME_CHANGE_PLAYER_NAME': (cxt, {player}) => {
            const tmp_player = cxt.state.tmp_change_player;
            if (tmp_player) {
                const nextPlayers = [...cxt.state.players];
                nextPlayers[player.id].name = tmp_player.name;
                nextPlayers[tmp_player.id].name = player.name;
                cxt.commit('GAME:UPDATE', {
                    tmp_change_player: null,
                    players: nextPlayers,
                });
            } else {
                cxt.commit('GAME:UPDATE', {
                    tmp_change_player: player,
                });
            };
        },
        'GAME_TOGGLE_VOTE': (cxt, {idx}) => {
            const state = cxt.state;
            const nextTracks = state.tracks;
            const votes = nextTracks[state.round - 1].opportunities[state.trackRoundNow - 1].votes;
            
            if (!isNaN(votes[idx])) {
                votes[idx] = votes[idx] === STATIC.VOTE.AGREE ? STATIC.VOTE.DISAGREE : STATIC.VOTE.AGREE;
            }
            
            cxt.commit('GAME:UPDATE', {
                tracks: nextTracks,
                tablePlayer: [...state.tablePlayer],
            });
        },
        'GAME_VOTE_AGREE': (cxt, {idx}) => {
            const state = cxt.state;
            const nextTracks = state.tracks;
            const votes = nextTracks[state.round - 1].opportunities[state.trackRoundNow - 1].votes;
            
            if (!isNaN(votes[idx])) {
                votes[idx] = STATIC.VOTE.AGREE;
            }

            cxt.commit('GAME:UPDATE', {
                tracks: nextTracks,
                tablePlayer: [...state.tablePlayer],
            });
        },
        'GAME_SAVE_ROUND_RESULT': (cxt, {win, go_players}) => {
            const save_round = cxt.state.trackRoundNow;
            const save_leader = cxt.state.leader;

            cxt.dispatch('GAME_SAVE_OPPORTUNITIES', {
                players: go_players,
            }).then(() => {
                const state = cxt.state;
                const round_idx = state.round - 1;
                const nextResults = state.results;
                nextResults[round_idx] = win ? STATIC.RESULT.SUCCESS : STATIC.RESULT.FAIL;

                const nextTracks = state.tracks;
                nextTracks[round_idx].go_round = save_round;
                nextTracks[round_idx].go_players = go_players;
                nextTracks[round_idx].go_leader_idx = save_leader;

                const nextRound = Math.min(5, state.round + 1);
                let nextFinal = cxt.state.resultsFinal;
                let nextResultMessage = cxt.state.resultMessage;

                if (nextResults.filter(e => e == STATIC.RESULT.FAIL).length >= 3) {
                    nextFinal = STATIC.RESULT.FAIL;
                    nextResultMessage = 'FAIL';
                } else if (nextResults.filter(e => e == STATIC.RESULT.SUCCESS).length >= 3) {
                    nextFinal = STATIC.RESULT.SUCCESS;
                    nextResultMessage = 'King of Arthur is win !';
                }

                cxt.commit('GAME:UPDATE', {
                    round: nextRound,
                    results: nextResults,
                    trackRoundNow: 1,
                    tracks: nextTracks,
                    resultsFinal: nextFinal,
                    resultMessage: nextResultMessage,
                });

                cxt.dispatch('GAME_SAVE_TO_LOCAL');
            });
            
        },
        'GAME_SAVE_OPPORTUNITIES': (cxt, {players}) => {
            const state = cxt.state;
            const round_idx = state.round - 1;
            const track_round_idx = state.trackRoundNow - 1;
            const nextTracks = state.tracks;
            const next = nextTracks[round_idx].opportunities[track_round_idx];
            next.leader_idx = state.leader;
            next.players = players;

            cxt.commit('GAME:UPDATE', {
                tracks: nextTracks,
                trackRoundNow: Math.min(5, state.trackRoundNow + 1),
                leader: (state.leader + 1) % state.playerNum,
            });
        },
        'GAME_TOGGLE_ROLE_POSSIBLE': (cxt, {player_idx, role}) => {
            const nextPossible = [...cxt.state.role_possible];
            const ary = nextPossible[player_idx];
            if (ary) {
                const aidx = ary.indexOf(role);
                if (aidx < 0) {
                    ary.push(role);
                } else {
                    ary.splice(aidx, 1);
                }
                
                cxt.commit('GAME:UPDATE', {
                    role_possible: nextPossible,
                });
            }
        },
        'GAME_CHANGE_GOOD_RATIO': (cxt, {player_idx, value}) => {
            const nextPlayers = [...cxt.state.players];
            nextPlayers[player_idx].goodRatio = value;
            cxt.commit('GAME:UPDATE', {
                players: nextPlayers,
            });
        },
        'GAME_SAVE_PLAYER_ROLE': (cxt, {player_idx, role, isGood}) => {
            const nextPlayers = [...cxt.state.players];
            nextPlayers[player_idx].role = role;
            nextPlayers[player_idx].goodRatio = isGood ? 100 : 0;
            cxt.commit('GAME:UPDATE', {
                players: nextPlayers,
            });
        },
        'GAME_SAVE_TO_LOCAL': (cxt) => {
            window && window.localStorage.setItem(STATIC.LOCALSTORAGE, JSON.stringify(cxt.state));
        },
        'GAME_SAVE_TO_HISTORY': (cxt) => {
            if (window) {
                const histories = JSON.parse(window.localStorage.getItem(STATIC.LOCALHISTORY) || '[]');
                const lastState = histories.slice(-1);
                if (lastState[0] && lastState[0].timestamp == cxt.state.timestamp) {
                    window.alert('same game with before');
                } else {
                    histories.push(cxt.state);
                    window.localStorage.setItem(STATIC.LOCALHISTORY, JSON.stringify(histories));
                }
            };
            cxt.commit('GAME:UPDATE', {
                opening: false,
            });
        },
        'GAME_TOGGLE_EDIT_PLAYER_MODE': (cxt) => {
            cxt.commit('GAME:UPDATE', {
                editPlayerMode: !cxt.state.editPlayerMode, 
            });
        },
        'GAME_ASSASSINATE': (cxt, isAssassinated) => {
            if (isAssassinated) {
                cxt.commit('GAME:UPDATE', {
                    resultsFinal: STATIC.RESULT.FAIL,
                    resultMessage: 'Merlin was assassinated',
                    resultsAssassinated: true, 
                });
            } else {
                cxt.commit('GAME:UPDATE', {
                    resultsFinal: STATIC.RESULT.SUCCESS,
                    resultMessage: 'King of Arthur is win !',
                    resultsAssassinated: false, 
                });
            }
            
        },
    },
    mutations: {
        'GAME:UPDATE': (state, payload) => {
            Object.keys(payload).map(key => {
                state[key] = payload[key];
            });
        }
    },
};


function basicPlayer(id) {
    return {
        'name': `Player [${id+1}]`,
        'id': id,
        'goodRatio': 50,
        'role': -1,
    };
}

export default model;