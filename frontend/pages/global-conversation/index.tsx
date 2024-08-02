import { Container } from '@mui/material';
import Layout from '../layout';
import { FeatureArticle } from "../../components/FeatureArticle";

const GlobalConversation: React.FC = () => {
  return (
    <Layout>
      <Container>
        <FeatureArticle
          title="Global Conversations Made Easy"
          descriptions={[
            "Experience seamless global communication with our real-time audio translation feature. Engage in conversations with people worldwide, regardless of language differences. Enjoy instant translation during your audio calls, connecting effortlessly with anyone, anywhere. Break down language barriers and foster meaningful relationships without delays or misunderstandings."
          ]}
          imagePath="/conversation.png"
        />

        {/*<GlobalConversationContent />*/}
      </Container>
    </Layout>
  );
};

export default GlobalConversation;
