import Link from 'next/link';
import { Box, List, ListItem, ListItemText } from '@mui/material';

const Sidebar = () => {
  return (
    <Box minWidth={200} bgcolor="primary.light">
      <List sx={{ position: "sticky", top: 64}}>
        <ListItem button component={Link} href="/voice-recorder">
          <ListItemText primary="Voice Recorder" />
        </ListItem>
        <ListItem button component={Link} href="/audio-translation">
          <ListItemText primary="Audio Translation" />
        </ListItem>
        <ListItem button component={Link} href="/global-conversation">
          <ListItemText primary="Global conversation" />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
