import { Box, Container, Tab, Tabs } from '@mui/material';
import { FeatureArticle } from '../../components/FeatureArticle';
import { Metadata } from '../../components/Metadata';
import { LayoutWithSidebar } from '../../components/LayoutWithSidebar';
import { useRouter } from 'next/router';
import { JoinCall } from '../../components/JoinCall';
import { CreateCall } from '../../components/CreateCall';

const GlobalConversation: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const tabValue = slug === 'join-call' ? 1 : 0;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) {
      router.push('/global-conversation');
    } else {
      router.push('/global-conversation/join-call');
    }
  };

  return (
    <LayoutWithSidebar>
      <Metadata
        title="Babylon Tower - Global Conversations Made Easy"
        description="Experience seamless global communication with our real-time audio translation feature."
        keywords="speech recognition, speech synthesis, translation, audio, Babylon Tower, Global Conversations"
        image="/conversation.png"
        url="https://babel-tower.vercel.app/global-conversation"
      />
      <Container>
        <FeatureArticle
          title="Global Conversations Made Easy"
          descriptions={[
            'Experience seamless global communication with our real-time audio translation feature. Engage in conversations with people worldwide, regardless of language differences. Enjoy instant translation during your audio calls, connecting effortlessly with anyone, anywhere. Break down language barriers and foster meaningful relationships without delays or misunderstandings.',
          ]}
          imagePath="/conversation.png"
        />
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ marginBottom: 2 }}
        >
          <Tab label="Create Call" sx={{ fontWeight: "bold" }} />
          <Tab label="Join Call" sx={{ fontWeight: "bold" }} />
        </Tabs>
        <Box>
          {tabValue === 0 && <CreateCall />}
          {tabValue === 1 && <JoinCall />}
        </Box>
      </Container>
    </LayoutWithSidebar>
  );
};

export default GlobalConversation;
