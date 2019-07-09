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
        MINIONS: 10,
        MORDRED: 11,
        ASSASSIN: 12,
        MORGANA: 13,
        OBERON: 14,
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
};

const model = {
    state: {
        stage: STATIC.WORLD.GAMEPLAYER['5'],
        mission: STATIC.WORLD.MISSION['5'],
        round: 1,
        playerNum: 5,
        players: new Array(5).fill(0).map((ele, idx) => { return { 'name': `Player [${idx+1}]` }; }),
        tablePlayer: new Array(10).fill(null),
        results: new Array(5).fill(STATIC.RESULT.UNDO),
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
                    players: new Array(player).fill(0).map((ele, idx) => { return originPlayers[idx] ? originPlayers[idx] : { 'name': `Player [${idx+1}]` }; }),
                    tablePlayer,
                    results: new Array(5).fill(STATIC.RESULT.UNDO),
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
                });
            } else {
                throw (`GAME_INIT ::: Can Not Specify Player Number As ${player}`);
            }
        },
        'GAME_BACK': (cxt) => {
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
            cxt.commit('GAME:UPDATE', json);
        },
        'GAME_CHOOSE_LEADER': (cxt, {idx}) => {
            cxt.commit('GAME:UPDATE', {
                leader: idx,
            });
        },
        'GAME_EDIT_PLAYER_NAME': (cxt, {idx, name}) => {
            const nextPlayer = cxt.state.players;
            nextPlayer[idx].name = name;
            cxt.commit('GAME:UPDATE', {
                players: nextPlayer,
            });
        },
        'GAME_TOGGLE_VOTE': (cxt, {idx}) => {
            const state = cxt.state;
            const nextTracks = state.tracks;
            const votes = nextTracks[state.round - 1].opportunities[state.trackRoundNow - 1].votes;
            
            if (!isNaN(votes[idx])) {
                votes[idx] = votes[idx] === STATIC.VOTE.AGREE ? STATIC.VOTE.DISAGREE : STATIC.VOTE.AGREE;
            }
            // console.log('votes',idx, votes, nextTracks);
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

                cxt.commit('GAME:UPDATE', {
                    round: Math.min(5, state.round + 1),
                    results: nextResults,
                    trackRoundNow: 1,
                    tracks: nextTracks,
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
        'GAME_SAVE_TO_LOCAL': (cxt) => {
            window && window.localStorage.setItem(STATIC.LOCALSTORAGE, JSON.stringify(cxt.state));
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

export default model;