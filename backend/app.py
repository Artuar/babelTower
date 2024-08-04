import asyncio
import argparse
from flask import Flask
from flask_cors import CORS
from pyngrok import ngrok
import requests
from websockets import serve

from websocket_handler import websocket_handler

app = Flask(__name__)
CORS(app)


async def start_server():
    server = await serve(websocket_handler, "127.0.0.1", 5000)
    print("WebSocket server is running on ws://127.0.0.1:5000")
    await server.wait_closed()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run Babylon Tower application.')
    parser.add_argument('--port', type=int, default=5000, help='Port number')
    parser.add_argument('--ngrok_token', type=str, default="", help='NGROK token')
    parser.add_argument('--is_debug', type=int, default=1, help='Use debug mode')
    args = parser.parse_args()

    PORT = args.port
    NGROK_TOKEN = args.ngrok_token
    IS_DEBUG = args.is_debug

    if NGROK_TOKEN:
        ngrok.set_auth_token(NGROK_TOKEN)
        # Close existing tunnels to avoid error
        for tunnel in ngrok.get_tunnels():
            ngrok.disconnect(tunnel.public_url)
        # run ngrok tunnel
        tunnel = ngrok.connect(
            addr="127.0.0.1:{}".format("5000"),
            proto="http",
            bind_tls=True,
            hostname="curious-goldfish-next.ngrok-free.app"
        )
        public_url = tunnel.public_url
        print(" * ngrok URL:", public_url)

        # send server url to front app
        response = requests.post('https://babel-tower.vercel.app/api/server-url', json={'serverUrl': public_url})
        if response.status_code == 200:
            print("Server URL updated successfully on Next.js API")
        else:
            print("Failed to update Server URL on Next.js API")

    asyncio.run(start_server())
