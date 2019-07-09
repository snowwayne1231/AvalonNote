const _private = {
    heartbeatTimer: 0,
    heartbeatTimestamp: NaN,
    handlers: [],
};

const model = {
    state: {
        server: {},
        url: '',
        room: 'a01',
    },
    getters: {

    },
    actions: {
        'SOCKET_INIT': (context) => {
            console.log('SOCKET_INIT content', context);
            const url = env('SOCKET_MAIN_DATA');
            const {server, promise} = buildSocketByContext(context, url);
            
            context.commit('SOCKET:UPDATE', {
                url,
                server,
            });

            return promise;
        },
        'SOCKET_SEND': (context, payload) => {

            const sending = (typeof payload === 'string')
            ? {
                payload,
                'cmd': 'normal',
                'size': '0000',
            }
            : {
                'payload': payload.payload,
                'cmd': payload.cmd,
                'size': '0000',
            };

            context.state.server.send(JSON.stringify(sending));
        },
        'SOCKET_SIGN_IN': (context) => {

            const user = context.rootState.user;
            const sending = {
                'cmd': 'signin',
                'size': '0000',
                'serverid': user.serverid,
                'sig':  user.sig,
            };

            context.state.server.send(JSON.stringify(sending));
        },
        'SOCKET_SET_HEARTBEAT': (context) => {

            _private.heartbeatTimer && window.clearInterval(_private.heartbeatTimer);
            
            const timer = window.setInterval(() => {
                context.state.server.send(JSON.stringify({
                    'cmd': 'heartbeat',
                    'size': '0000',
                }));
            }, 10000);

            _private.heartbeatTimer = timer;
        },
        'SOCKET_REBUILD': (context) => {
            console.log('SOCKET_REBUILD... will rebuild in 5 sec.');
            window.setTimeout(() => {
                const {server} = buildSocketByContext(context);
            
                context.commit('SOCKET:UPDATE', {
                    server,
                });
            }, 5000);
        },
    },
    mutations: {
        'SOCKET:UPDATE': (state, {url, server}) => {
            if (url) state.url = url;
            if (server) state.server = server;
        },
    },
};

export default model;


function buildSocketByContext(context, url) {
    const server = new WebSocket(`ws://${url || context.state.url}${context.state.room}`);
    const promise = new Promise((resolve, reject) => {

        server.addEventListener('open', onOpen.bind(resolve));

        server.addEventListener('close', onClose);

        server.addEventListener('message', onMessage);

        server.addEventListener('error', onError);
    });

    return {server, promise};

    function onOpen(evt) {
        context.dispatch('SOCKET_SIGN_IN');
        context.dispatch('SOCKET_SET_HEARTBEAT');

        console.log('socket open', evt);
        this(evt);
    }

    function onClose(evt) {
        console.log('socket close', evt);
        context.dispatch('SOCKET_REBUILD');
    }

    function onMessage(evt) {
        console.log('socket message', evt);
        const data = JSON.parse(evt.data);
        console.log(data);
    }

    function onError(evt) {
        console.error('socket error', evt, context);
    }
}