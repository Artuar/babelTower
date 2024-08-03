import { Box, Grid, Typography } from '@mui/material';
import Image from 'next/image';

interface FeatureArticleProps {
  title: string;
  descriptions: React.ReactNode[];
  imagePath: string;
}

export const FeatureArticle = ({
  title,
  descriptions,
  imagePath,
}: FeatureArticleProps) => {
  return (
    <Box my={4}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={4} justifyContent="center" display="flex">
          <Image src={imagePath} alt={title} width={300} height={300} />
        </Grid>
        <Grid
          item
          xs={12}
          md={8}
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
        >
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          {descriptions.map((description, key) => (
            <Typography variant="body1" key={key} paragraph>
              {description}
            </Typography>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};
