import { Box, Typography, Button } from '@mui/material';

interface ErrorBlockProps {
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}

export const ErrorBlock = ({
  title,
  description,
  button,
  onClick,
}: ErrorBlockProps) => {
  return (
    <Box mt={4} alignItems="center" flexDirection="column" display="flex">
      <Box mt={4} textAlign="center" color="error.main">
        <Typography variant="h4">{title}</Typography>
        <Typography variant="body2">{description}</Typography>
      </Box>
      <Button color="secondary" onClick={onClick}>
        {button}
      </Button>
    </Box>
  );
};
