import { AppBar, Toolbar, Typography } from '@mui/material';
import Image from 'next/image';
import { Link } from './Link';

export const Header: React.FC = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Image
          src="/logo_light.png"
          alt="Babylon Tower Logo"
          width={40}
          height={40}
        />
        <Typography variant="h6" style={{ flexGrow: 1, marginLeft: 8 }}>
          <Link href="/">Babylon Tower</Link>
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
