import { Box } from "@mui/material";
import { ProcessedData } from "./types";

interface ConsoleProps {
  processedDataList: ProcessedData[]
  recording: boolean
}

export const Console: React.FC<ConsoleProps> = ({ processedDataList, recording }) => {
  return <>
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
      <Box sx={{ color: '#c5b128', paddingY: 1, fontWeight: "bold" }}>{recording ? "Recording..." : "Recording is turned off"}</Box>
      {processedDataList.map((data) => {
        if (data.translated_text === "") {
          return <></>
        }

        return <Box
          key={data.timestamp}
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: 1,
            paddingTop: 1,
            borderBottom: '1px solid #444',
            '&:hover': {
              backgroundColor: '#444',
            },
            position: 'relative',
          }}
        >
          <Box sx={{ color: '#999' }}>
            <div>{data.timestamp}</div>
            <div>delay: {data.synthesis_delay}</div>
          </Box>
          <Box>
            <div style={{ color: '#fff' }}>{data.translated_text}</div>
            <div style={{ color: '#999' }}>{data.original_text}</div>
          </Box>
          <Box sx={{ alignSelf: 'end', opacity: 0, '&:hover': { opacity: 1 } }}>
            <audio controls src={`data:audio/mp3;base64,${data.audio}`}></audio>
          </Box>
        </Box>
      })}
    </Box>
  </>
}