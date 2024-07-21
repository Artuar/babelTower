import Image from 'next/image';
import {
  Typography,
  Grid,
  Box,
} from '@mui/material';
import Layout from "./layout";
import { Feature } from "../components/Feature";

const Home: React.FC = () => {
  return (
    <Layout>
      <Box my={4}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4} justifyContent="center" display="flex">
            <Image src="/big_logo.png" alt="Babylon Tower" width={300} height={300} />
          </Grid>
          <Grid item xs={12} md={8} display="flex" flexDirection="column" alignItems="flex-start">
            <Typography variant="h4" gutterBottom>
              Welcome to Babylon Tower
            </Typography>
            <Typography variant="body1" paragraph>
              Babylon Tower bridges the communication gap between people speaking different languages. Our platform offers cutting-edge features for text and audio recognition and translation, all powered by the advanced <a href="https://github.com/Artuar/babylon_sts" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}>babylon_sts</a> library. Whether you're conversing in real-time or translating audio files, Babylon Tower makes seamless communication a reality.
            </Typography>
            <Typography variant="body1" paragraph>
              This project was created by enthusiasts who aim to solve the problem of communication and the limitations imposed by the multitude of languages. We strive to break down language barriers and make global communication accessible to everyone.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        <Feature
          imagePath="/audio.png"
          title="Effortless Audio Translations"
          description="Easily translate audio files with our intuitive tool. Upload your audio and receive accurate translations in no time."
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
        <Feature
          imagePath="/record.png"
          title="Speak and Translate Instantly"
          description="Dictate your message and receive immediate translations along with audio synthesis in your chosen language. Perfect for on-the-go conversations."
        />
      </Grid>
    </Layout>
  );
};

export default Home;
