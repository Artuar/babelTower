module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/ws/:path*',
        destination: 'https://833e-46-131-77-130.ngrok-free.app/:path*', // проксі пересилає запити на цей URL
      },
    ];
  },
}

