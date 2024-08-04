import { Box, CircularProgress, Typography } from '@mui/material';
import { Link } from './Link';

interface LoadingProps {
  text?: string;
  url?: string;
}

export const Loading = ({ text = 'Loading', url }: LoadingProps) => {
  return (
    <Box mt={4} textAlign="center">
      <CircularProgress />
      <Typography variant="h6" mt={2}>
        {text}...
      </Typography>
      {url && (
        <Typography variant="body1">
          Please check availability of{' '}
          <Link
            target="serverUrl"
            href={url}
            style={{ textDecoration: 'underline', fontWeight: 'bold' }}
          >
            {url}
          </Link>
        </Typography>
      )}
    </Box>
  );
};
