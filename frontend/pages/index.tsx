import { Box, Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { Feature } from '../components/Feature';
import { Link } from '../components/Link';
import { NextPageWithLayout } from './_app';
import { Metadata } from '../components/Metadata';

const Home: NextPageWithLayout = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Metadata
        title="Babylon Tower"
        description="Your ultimate solution for speech recognition and synthesis."
        keywords="speech recognition, speech synthesis, translation, audio, Babylon Tower"
        image="/big_logo.png"
        url="https://babel-tower.vercel.app"
      />
      <Box my={4}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4} justifyContent="center" display="flex">
            <Image
              src="/big_logo.png"
              alt="Babylon Tower"
              width={300}
              height={300}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
          >
            <Typography variant="h4" gutterBottom>
              Welcome to Babylon Tower
            </Typography>
            <Typography variant="body1" paragraph>
              Babylon Tower bridges the communication gap between people
              speaking different languages. Our platform offers cutting-edge
              features for text and audio recognition and translation, all
              powered by the advanced{' '}
              <Link
                href="https://github.com/Artuar/babylon_sts"
                target="babylon_sts"
                style={{ fontWeight: 'bold' }}
              >
                babylon_sts
              </Link>
              library. Whether you`&apos;re conversing in real-time or
              translating audio files, Babylon Tower makes seamless
              communication a reality.
            </Typography>
            <Typography variant="body1" paragraph>
              This project was created by enthusiasts who aim to solve the
              problem of communication and the limitations imposed by the
              multitude of languages. We strive to break down language barriers
              and make global communication accessible to everyone.
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={4}>
        <Feature
          imagePath="/record.png"
          title="Speak and Translate Instantly"
          description="Enhance your note-taking and subtitling process with our cutting-edge feature. Dictate your messages using your voice and instantly receive both translated text and synthesized audio in your chosen language. Perfect for creating notes or subtitles on the go, this feature ensures you capture and translate your thoughts quickly and accurately. Speak, translate, and listen with ease, making your workflow more efficient and effective."
          link="/voice-recorder"
        />
        <Feature
          imagePath="/conversation.png"
          title="Global Conversations Made Easy"
          description="Experience seamless global communication with our real-time audio translation feature. Engage in conversations with people worldwide, regardless of language differences. Enjoy instant translation during your audio calls, connecting effortlessly with anyone, anywhere. Break down language barriers and foster meaningful relationships without delays or misunderstandings."
          link="/global-conversation"
        />
        <Feature
          imagePath="/writer.png"
          title="Text-to-Voice Translator"
          description="Transform written text into spoken translation in just seconds. Enter any text, choose your target language, and instantly receive a synthesized voice translation. Perfect for quickly generating audio in your desired language for learning, work, or simply for fun. Enjoy clear, natural-sounding translations anytime, anywhere."
          link="/text-translator"
        />
        <Feature
          imagePath="/audio.png"
          title="Effortless Audio Translations"
          description="Easily translate audio files with our intuitive tool. Upload your audio and receive accurate translations in no time. This feature allows users to upload their audio files and translate the conversation within them into any of the supported languages. The background sounds are preserved during the translation process, ensuring the original context and ambiance remain intact."
          link="/audio-translation"
        />
      </Grid>
    </div>
  );
};

export default Home;
