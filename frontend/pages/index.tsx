import { Grid } from '@mui/material';
import Layout from "./layout";
import { Feature } from "../components/Feature";
import { FeatureArticle } from "../components/FeatureArticle";

const Home: React.FC = () => {
  return (
    <Layout>
      <FeatureArticle
        title="Welcome to Babylon Tower"
        imagePath="/big_logo.png"
        descriptions={[
          <>Babylon Tower bridges the communication gap between people speaking different languages. Our platform offers cutting-edge features for text and audio recognition and translation, all powered by the advanced <a href="https://github.com/Artuar/babylon_sts" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}>babylon_sts</a> library. Whether you're conversing in real-time or translating audio files, Babylon Tower makes seamless communication a reality.</>,
          <>This project was created by enthusiasts who aim to solve the problem of communication and the limitations imposed by the multitude of languages. We strive to break down language barriers and make global communication accessible to everyone.</>
        ]}
      />

      <Grid container spacing={4}>
        <Feature
          imagePath="/audio.png"
          title="Effortless Audio Translations"
          description="Easily translate audio files with our intuitive tool. Upload your audio and receive accurate translations in no time. This feature allows users to upload their audio files and translate the conversation within them into any of the supported languages. The background sounds are preserved during the translation process, ensuring the original context and ambiance remain intact."
          link="/audio-translation"
        />
        <Feature
          imagePath="/record.png"
          title="Speak and Translate Instantly"
          description="Enhance your note-taking and subtitling process with our cutting-edge feature. Dictate your messages using your voice and instantly receive both translated text and synthesized audio in your chosen language. Perfect for creating notes or subtitles on the go, this feature ensures you capture and translate your thoughts quickly and accurately. Speak, translate, and listen with ease, making your workflow more efficient and effective."
          link="/voice-recorder"
        />
        <Feature
          imagePath="/conversation.png"
          title="Global Conversations Made Easy"
          description="Connect with anyone, anywhere. Make real-time audio calls with automatic translation, allowing you to talk effortlessly without language barriers or delays."
        />
        <Feature
          imagePath="/walkytalky.png"
          title="Instant Voice Messaging"
          description="Send and receive short voice messages with real-time translation. Experience seamless communication as your messages are instantly translated to your preferred language."
        />
      </Grid>
    </Layout>
  );
};

export default Home;
