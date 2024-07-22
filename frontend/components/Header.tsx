import {AppBar, Button, MenuItem, Select, Toolbar, Typography, Link } from "@mui/material";
import Image from "next/image";
import {useState} from "react";

export const Header: React.FC = () => {
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value as string);
  };

  return <AppBar position="fixed">
    <Toolbar>
      <Image src="/logo_light.png" alt="Babylon Tower Logo" width={40} height={40} />
      <Typography variant="h6" style={{ flexGrow: 1, marginLeft: 8 }}>
        <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          Babylon Tower
        </a>
      </Typography>
      <Select
        value={language}
        onChange={handleLanguageChange}
        style={{ marginRight: 16, color: 'white' }}
      >
        <MenuItem value={'en'}>English</MenuItem>
        <MenuItem value={'ua'}>Українська</MenuItem>
        <MenuItem value={'ru'}>Русский</MenuItem>
        <MenuItem value={'fr'}>Français</MenuItem>
        <MenuItem value={'de'}>Deutsch</MenuItem>
        <MenuItem value={'es'}>Español</MenuItem>
        <MenuItem value={'hi'}>हिन्दी</MenuItem>
      </Select>
      <Button color="inherit">Login</Button>
    </Toolbar>
  </AppBar>
}