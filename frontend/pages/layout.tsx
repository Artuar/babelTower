import {
  Toolbar,
  Container,
} from '@mui/material';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />

      {/* Add top padding to the main container to avoid content being hidden behind the AppBar */}
      <Toolbar />

      <Container>
        {children}
      </Container>

      <Footer />
    </>
  );
};

export default Layout;
