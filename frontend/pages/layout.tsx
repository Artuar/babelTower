import {
  Toolbar,
  Container,
  Box,
} from '@mui/material';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
    >
      <Header />

      {/* Add top padding to the main container to avoid content being hidden behind the AppBar */}
      <Toolbar />

      <Container style={{ flexGrow: 1 }}>
        {children}
      </Container>

      <Footer />
    </Box>
  );
};

export default Layout;