import { motion } from 'framer-motion';
import { Button, Card, CardActions, CardContent, Grid, Typography } from '@mui/material';
import Image from 'next/image';

interface FeatureProps {
  imagePath: string;
  title: string;
  description: string;
  link?: string;
}

export const Feature: React.FC<FeatureProps> = ({ imagePath, title, description, link }) => {
  return (
    <Grid item xs={12}>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <Card sx={{ boxShadow: 'none' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Image src={imagePath} alt={title} width={200} height={200} />
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" component="div">
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
                {
                  link &&
                  <CardActions sx={{ paddingX: 0 }}>
                    <Button size="small" href={link}>Try now</Button>
                  </CardActions>
                }
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};

export default Feature;
