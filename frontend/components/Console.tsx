import { Box, keyframes, Typography } from "@mui/material";
import { ProcessedData } from "../types/types";

interface ConsoleProps {
  processedDataList: ProcessedData[];
  recording: boolean;
}

// Define keyframes for pulsating animation
const pulseAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.2; }
  100% { opacity: 1; }
`;

export const Console: React.FC<ConsoleProps> = ({ processedDataList, recording }) => {
  return (
    <>
      <Typography variant="h5">Processed Data</Typography>
      <Box
        sx={{
          height: 'calc(100vh - 200px)',
          overflowY: 'scroll',
          backgroundColor: '#333',
          padding: 2,
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            color: '#c5b128',
            paddingY: 1,
            fontWeight: "bold",
            animation: recording ? `${pulseAnimation} 1.5s infinite` : 'none',
          }}
        >
          {recording ? "Recording..." : "Recording is turned off"}
        </Box>
        {processedDataList
          .filter((data => data.original_text !== ""))
          .sort((a, b) => a.timestamp < b.timestamp ? 1 : -1)
          .map((data) => {
          return (
            <Box
              key={data.timestamp}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                paddingY: 1,
                borderBottom: '1px solid #444',
                '&:hover': {
                  backgroundColor: '#444',
                },
                position: 'relative',
                '&:hover .audio-control': {
                  opacity: 1,
                },
              }}
            >
              <Box sx={{
                color: '#999',
                mt: 1,
                mr: { xs: 0, md: 1 },
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' },
                justifyContent: { xs: 'space-between', md: 'flex-start' }
              }}>
                <Box sx={{ whiteSpace: "nowrap" }}>{data.timestamp}</Box>
                <Box sx={{ marginLeft: { xs: 2, md: 0 } }}>delay: {data.synthesis_delay}</Box>
              </Box>
              <Box sx={{ mt: 1 }}>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>{data.translated_text}</div>
                <div style={{ color: '#999' }}>{data.original_text}</div>
              </Box>
              <Box
                className="audio-control"
                sx={{
                  display: "flex",
                  flex: 1,
                  mt: 1,
                  opacity: 0.2,
                  justifyContent: { xs: 'center', md: 'flex-end' },
                  alignSelf: "center",
                  transition: 'opacity 0.5s',
                }}
              >
                <audio controls src={`data:audio/mp3;base64,${data.audio}`}></audio>
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
};
