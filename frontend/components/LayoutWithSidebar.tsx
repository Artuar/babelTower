import { Box } from '@mui/material';
import Sidebar from './Sidebar';

interface LayoutWithSidebarProps {
  children: React.ReactNode;
}

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ children }) => {
  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1}>{children}</Box>
    </Box>
  );
};
