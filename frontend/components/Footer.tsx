import { Box, Container, Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { Link } from './Link';

export const Footer: React.FC = () => {
  return (
    <Box bgcolor="primary.main" color="primary.contrastText" py={5}>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Image
                src="/logo_light.png"
                alt="Babylon Tower Logo"
                width={40}
                height={40}
              />
              <Typography variant="h6" style={{ marginLeft: 8 }}>
                Babylon Tower
              </Typography>
            </Box>
            <Typography variant="body2">
              Helping people of different languages communicate with ease.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Features
            </Typography>
            <Typography variant="body2" display="flex" flexDirection="column">
              <Link href="/voice-recorder">Speak and Translate Instantly</Link>
              <Link href="/global-conversation">
                Global Conversations Made Easy
              </Link>
              <Link href="/text-translator">Text-to-Voice Translator</Link>
              <Link href="/audio-translation">
                Effortless Audio Translations
              </Link>
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography variant="body2" display="flex" flexDirection="column">
              <Link
                href="https://github.com/Artuar/babelTower"
                target="babylonTower"
              >
                About the project
              </Link>
              <Link
                href="https://github.com/Artuar/babylon_sts"
                target="babylon_sts"
              >
                About babylon_sts
              </Link>
            </Typography>
          </Grid>
        </Grid>
        <Box textAlign="center" mt={5}>
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} Babylon Tower. All rights
            reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
