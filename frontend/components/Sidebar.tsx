import Link from 'next/link';
import { Box, List, ListItem, ListItemText } from '@mui/material';
import { useRouter } from 'next/router';

const Item = ({ link, name }: { link: string; name: string }) => {
  const router = useRouter();

  const isActive = router.pathname === link;
  return (
    <ListItem
      button
      component={Link}
      href={link}
      sx={{
        bgcolor: isActive ? 'primary.main' : 'inherit',
        color: isActive ? 'primary.contrastText' : 'inherit',
        ':hover': {
          color: 'inherit',
        },
      }}
    >
      <ListItemText primary={name} />
    </ListItem>
  );
};

const Sidebar = () => {
  return (
    <Box
      minWidth={200}
      bgcolor="primary.light"
      position="sticky"
      top={{ xs: 56, sm: 64 }}
      zIndex={1}
    >
      <List
        sx={{
          position: 'sticky',
          top: { xs: 56, sm: 64 },
          padding: 0,
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
        }}
      >
        <Item link="/voice-recorder" name="Voice Recorder" />
        <Item link="/audio-translation" name="Audio Translation" />
        <Item link="/global-conversation" name="Global conversation" />
      </List>
    </Box>
  );
};

export default Sidebar;
