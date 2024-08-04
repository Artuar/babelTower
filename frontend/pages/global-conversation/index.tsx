import { Container } from '@mui/material';
import { FeatureArticle } from '../../components/FeatureArticle';
import { Metadata } from '../../components/Metadata';

const GlobalConversation: React.FC = () => {
  return (
    <>
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

        {/*<GlobalConversationContent />*/}
      </Container>
    </>
  );
};

export default GlobalConversation;
