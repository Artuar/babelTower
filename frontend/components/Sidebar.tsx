import Link from 'next/link';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Item = ({
  link,
  name,
  icon,
}: {
  link: string;
  name: string;
  icon: string;
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isActive = router.pathname.includes(link);
  return (
    <ListItem
      button
      component={Link}
      href={link}
      sx={{
        display: 'flex',
        justifyContent: { xs: 'center', sm: 'flex-start' },
        bgcolor: isActive ? 'primary.main' : 'inherit',
        color: isActive ? 'primary.contrastText' : 'inherit',
        ':hover': {
          color: 'inherit',
        },
      }}
    >
      {isMobile ? (
        <ListItemIcon>
          <Image src={icon} alt={name} width={50} height={50} />
        </ListItemIcon>
      ) : (
        <ListItemText primary={name} />
      )}
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
        <Item link="/voice-recorder" icon="/record.png" name="Voice Recorder" />
        <Item
          link="/audio-translation"
          icon="/audio.png"
          name="Audio Translation"
        />
        <Item
          link="/global-conversation"
          icon="/conversation.png"
          name="Global conversation"
        />
      </List>
    </Box>
  );
};

export default Sidebar;
