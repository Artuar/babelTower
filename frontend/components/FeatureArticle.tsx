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
        <Grid
          item
          xs={12}
          lg={2}
          justifyContent="center"
          display={{ xs: "none", lg: "flex" }}
        >
          <Image src={imagePath} alt={title} width={150} height={150} />
        </Grid>
        <Grid
          item
          xs={12}
          lg={10}
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
