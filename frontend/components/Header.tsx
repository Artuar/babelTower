import { AppBar, Toolbar, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import { Link } from './Link';
import { LANGUAGES } from '../constants/constants';
import { Select } from './Select';

export const Header: React.FC = () => {
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value as string);
  };

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
        <Select
          value={language}
          onChange={handleLanguageChange}
          style={{ marginRight: 16, color: 'white' }}
          options={LANGUAGES}
          fullWidth={false}
        />
      </Toolbar>
    </AppBar>
  );
};
