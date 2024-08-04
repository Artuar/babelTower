import { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { FILE_MAX_SIZE, FILE_TYPE } from '../constants/constants';

interface FileDragAndDropProps {
  onFileSelected: (base64: string) => void;
}

const FileDragAndDrop = ({ onFileSelected }: FileDragAndDropProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file && file.size <= FILE_MAX_SIZE && file.type === FILE_TYPE) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        onFileSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an MP3 file under 10MB.');
    }
  };

  return (
    <Grid container paddingY={4}>
      <Grid item xs={12}>
        <Box
          p={2}
          height="200px"
          border="1px dashed grey"
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          onDrop={(e) => {
            e.preventDefault();
            handleFileChange(
              e as unknown as React.ChangeEvent<HTMLInputElement>,
            );
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Typography>Drop your MP3 file here or click to upload</Typography>
          <input
            type="file"
            accept="audio/mpeg"
            style={{ display: 'none' }}
            id="upload-button"
            onChange={handleFileChange}
          />
          <label htmlFor="upload-button">
            <Box
              component="span"
              sx={{
                mt: 2,
                cursor: 'pointer',
                color: 'primary.main',
                textDecoration: 'underline',
              }}
            >
              Choose File
            </Box>
          </label>
          {selectedFile && (
            <Typography variant="body2" mt={2}>
              Selected file: {selectedFile.name}
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default FileDragAndDrop;
