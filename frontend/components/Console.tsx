import { Box, keyframes } from "@mui/material";
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
      <h2>Processed Data</h2>
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
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: 1,
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
              <Box sx={{ color: '#999' }}>
                <div>{data.timestamp}</div>
                <div>delay: {data.synthesis_delay}</div>
              </Box>
              <Box>
                <div style={{ color: '#fff', fontWeight: "bold" }}>{data.translated_text}</div>
                <div style={{ color: '#999' }}>{data.original_text}</div>
              </Box>
              <Box
                className="audio-control"
                sx={{
                  alignSelf: 'center',
                  opacity: 0.2,
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
