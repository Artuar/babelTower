import { Grid } from '@mui/material';
import { Feature } from '../components/Feature';
import { FeatureArticle } from '../components/FeatureArticle';
import { Link } from '../components/Link';
import { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout = () => {
  return (
    <>
      <FeatureArticle
        title="Welcome to Babylon Tower"
        imagePath="/big_logo.png"
        descriptions={[
          <>
            Babylon Tower bridges the communication gap between people speaking
            different languages. Our platform offers cutting-edge features for
            text and audio recognition and translation, all powered by the
            advanced{' '}
            <Link
              href="https://github.com/Artuar/babylon_sts"
              target="babylon_sts"
              style={{ fontWeight: 'bold' }}
            >
              babylon_sts
            </Link>
            {" library. Whether you're conversing in real-time or translating audio" +
              ' files, Babylon Tower makes seamless communication a reality.'}
          </>,
          <>
            This project was created by enthusiasts who aim to solve the problem
            of communication and the limitations imposed by the multitude of
            languages. We strive to break down language barriers and make global
            communication accessible to everyone.
          </>,
        ]}
      />

      <Grid container spacing={4}>
        <Feature
          imagePath="/record.png"
          title="Speak and Translate Instantly"
          description="Enhance your note-taking and subtitling process with our cutting-edge feature. Dictate your messages using your voice and instantly receive both translated text and synthesized audio in your chosen language. Perfect for creating notes or subtitles on the go, this feature ensures you capture and translate your thoughts quickly and accurately. Speak, translate, and listen with ease, making your workflow more efficient and effective."
          link="/voice-recorder"
        />
        <Feature
          imagePath="/audio.png"
          title="Effortless Audio Translations"
          description="Easily translate audio files with our intuitive tool. Upload your audio and receive accurate translations in no time. This feature allows users to upload their audio files and translate the conversation within them into any of the supported languages. The background sounds are preserved during the translation process, ensuring the original context and ambiance remain intact."
          link="/audio-translation"
        />
        <Feature
          imagePath="/conversation.png"
          title="Global Conversations Made Easy"
          description="Experience seamless global communication with our real-time audio translation feature. Engage in conversations with people worldwide, regardless of language differences. Enjoy instant translation during your audio calls, connecting effortlessly with anyone, anywhere. Break down language barriers and foster meaningful relationships without delays or misunderstandings."
          link="/global-conversation"
        />
      </Grid>
    </>
  );
};

export default Home;
