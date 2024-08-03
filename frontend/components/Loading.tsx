import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  text?: string;
}

export const Loading = ({ text = 'Loading' }: LoadingProps) => {
  return (
    <Box mt={4} textAlign="center">
      <CircularProgress />
      <Typography variant="h6" mt={2}>
        {text}...
      </Typography>
    </Box>
  );
};
