import {Box, Container, Grid, Typography} from "@mui/material";
import Image from "next/image";

export const Footer: React.FC = () => {
  return <Box mt={5} bgcolor="primary.main" color="primary.contrastText" py={5}>
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box display="flex" alignItems="center" mb={2}>
            <Image src="/logo_light.png" alt="Babylon Tower Logo" width={40} height={40} />
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
          <Typography variant="body2">
            <a href="/audio-translation" style={{ color: 'inherit', textDecoration: 'none' }}>Effortless Audio Translations</a>
            <a href="/voice-recorder" style={{ color: 'inherit', textDecoration: 'none' }}>Speak and Translate Instantly</a><br />
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Instant Voice Messaging</a><br />
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Global Conversations Made Easy</a><br />
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            About
          </Typography>
          <Typography variant="body2">
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About the project</a><br />
            <a href="https://github.com/Artuar/babylon_sts" target="babylon_sts" style={{ color: 'inherit', textDecoration: 'none' }}>About babylon_sts</a>
          </Typography>
        </Grid>
      </Grid>
      <Box textAlign="center" mt={5}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} Babylon Tower. All rights reserved.
        </Typography>
      </Box>
    </Container>
  </Box>
}