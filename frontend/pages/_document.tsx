import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <title>Babylon Tower</title>
          {/* SEO */}
          <meta
            name="description"
            content="Babylon Tower - Your ultimate solution for speech recognition and synthesis."
          />
          <meta
            name="keywords"
            content="speech recognition, speech synthesis, translation, audio, Babylon Tower"
          />

          {/* Open Graph */}
          <meta property="og:title" content="Babylon Tower" />
          <meta
            property="og:description"
            content="Your ultimate solution for speech recognition and synthesis."
          />
          <meta property="og:image" content="/logo_light.png" />
          <meta property="og:url" content="https://babel-tower.vercel.app/voice-recorder" />
          <meta property="og:type" content="website" />

          {/* Twitter Cards */}
          <meta name="twitter:card" content="/logo_light.png" />
          <meta name="twitter:title" content="Babylon Tower" />
          <meta
            name="twitter:description"
            content="Your ultimate solution for speech recognition and synthesis."
          />
          <meta name="twitter:image" content="/logo_light.png" />

          {/* Other */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="UTF-8" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
