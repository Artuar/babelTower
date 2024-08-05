from pyngrok import ngrok

NGROK_PERMANENT_URL = "curious-goldfish-next.ngrok-free.app"


def create_ngrok_tunnel(token, port):
    ngrok.set_auth_token(token)
    # Close existing tunnels to avoid error
    for tunnel in ngrok.get_tunnels():
        ngrok.disconnect(tunnel.public_url)
    # run ngrok tunnel
    tunnel = ngrok.connect(
        addr=f"127.0.0.1:{port}",
        proto="http",
        bind_tls=True,
        hostname=NGROK_PERMANENT_URL
    )
    public_url = tunnel.public_url
    print(" * ngrok URL:", public_url)
