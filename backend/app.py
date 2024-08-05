import asyncio
import argparse
from flask import Flask
from flask_cors import CORS
from websockets import serve

from ngrok_tunnel import create_ngrok_tunnel
from websocket_handler import websocket_handler

app = Flask(__name__)
CORS(app)


async def start_server(port: int):
    server = await serve(websocket_handler, "127.0.0.1", port)
    print(f"WebSocket server is running on ws://127.0.0.1:{port}")
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
        create_ngrok_tunnel(NGROK_TOKEN, PORT)

    asyncio.run(start_server(PORT))
