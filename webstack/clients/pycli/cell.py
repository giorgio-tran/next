import socketio
import threading
import uuid
import json
import requests
from datetime import datetime


# Socket client
# sio = socketio.Client()
# Verbose mode
sio = socketio.Client(logger=True, engineio_logger=True)


# server = 'https://minim1.evl.uic.edu'
server = 'http://localhost:3333'
# web socket path
path = "/api/connect-ws"

# index of the board we want to address
myboard = 'Main Board'
myboard_id = ''

token = ''
with open('token_test.json') as f:
    data = json.load(f)
    token = data['token']
print('Token:', token)


def getData(ref_id):
    """Get a json value for a data reference, over HTTP
    """
    head = {'Authorization': 'Bearer {}'.format(token)}
    r = requests.get(server + '/api/data/' + ref_id, headers=head)
    return r.json()['data']


def boardAction(boardId, payload):
    """Post an action to  a board
    """
    head = {'Authorization': 'Bearer {}'.format(token)}
    r = requests.post(server + '/api/boards/act/' + boardId,
                      headers=head, json=payload)
    print('Board act>', r)
    return r


# Global list of cell references
CellReference = []


def decodeApp(name, app):
    """Decode the app internal state
    """
    global CellReference
    if name == 'snippets':
        print('snippets', app['id'], 'reference',
              app['state']['snippets']['reference'])
        # keep track of cell data refs.
        CellReference.append(app['state']['snippets']['reference'])


@sio.event
def connect():
    global myboard_id
    print('WS> connection established')
    head = {'Authorization': 'Bearer {}'.format(token)}
    r = requests.get(server + '/api/boards/', headers=head)
    boards = r.json()['boards']
    i = 0
    for b in boards:
        print('Board>', i, '-', b['name'], '-', b['id'])
        if myboard == b['name']:
            myboard_id = b['id']
        i = i + 1
    print('Board>', myboard_id)
    # subscribe to a board
    sio.emit('board-connect', {'boardId': myboard_id})


@sio.event
def connect_error(message):
    print(f"Connection was rejected due to {message}")
    
@sio.event
async def disconnect():
    print('WS> disconnected from server')


def reducerData(ref, d):
    """Handle an update of cell reducer
    """
    for cell in d:
        print('Reducer>', cell)
        if cell['needrun']:
            print('need to run this', cell['code'])
            print('board', myboard_id)
            current_time = datetime.now().strftime("%H:%M:%S")
            # result = str(eval(cell['code']))
            result = " some values "
            boardAction(myboard_id, {
                'type': 'dispatch-action',
                'reference': ref,
                'action': {
                    'type': 'output',
                    'id': cell['id'],
                    'output': current_time + '> ' + result
                }
            })


@sio.on('data')
def appUpdates(msg):
    global CellReference
    #  print('Updates>', msg)
    # initial update, all apps
    if len(msg['updates']['apps']) == 0 and len(msg['updates']['data']) == 0:
        # initial message with all existing apps
        print('All Apps')
        apps = msg['state']['apps']
        for appid in apps:
            app = apps[appid]
            print('App> id', app['id'])
            # decode the app values (app specific)
            decodeApp(app['appName'], app)

    # Go over the app updates: new app, move, ...
    for appid in msg['updates']['apps']:
        hasupdate = msg['updates']['apps'][appid]
        if hasupdate:
            if appid in msg['state']['apps'].keys():
                app = msg['state']['apps'][appid]
                print('App> new/move/resize', appid)
                # decode the app values (app specific)
                decodeApp(app['appName'], app)
            else:
                # if app not in collection, it was deleted
                print('App> delete', appid)

    # Go over the data updates
    for ref_id in msg['updates']['data']:
        hasupdate = msg['updates']['data'][ref_id]
        if hasupdate:
            print('App> data update', ref_id)
            # use the reference to get the value
            updatedata = getData(ref_id)
            print('       value:', updatedata)
            # check if it's a cell reducer
            if ref_id in CellReference:
                reducerData(ref_id, updatedata)


@sio.on('boards-update')
def boards_update(data):
    # board creation / deletion / ...
    print('Boards updates> ', data)


if __name__ == '__main__':
    print("I am in 1")
    print(f"Server: {server}")
    print(f"socketio_path: {path}")
    print(f"token: {token}")
    
    sio.connect(server, socketio_path=path, auth={'token': token})

    sio.wait()
