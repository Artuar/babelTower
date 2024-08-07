import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const LayoutWithSidebar = ({ children }) => {
  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1}>
        {children}
      </Box>
    </Box>
  );
};

export default LayoutWithSidebar;
