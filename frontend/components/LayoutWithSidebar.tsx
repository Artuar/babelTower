import { Box } from '@mui/material';
import Sidebar from './Sidebar';

interface LayoutWithSidebarProps {
  children: React.ReactNode;
}

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ children }) => {
  return (
    <Box display="flex" flexGrow="1" sx={{ flexDirection: { xs: "column", md: 'row' } }}>
      <Sidebar />
      <Box flexGrow={1} mb={5}>{children}</Box>
    </Box>
  );
};
