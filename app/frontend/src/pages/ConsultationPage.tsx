import Layout from '@/components/Layout';
import RequestConsultation from '@/components/RequestConsultation';

export default function ConsultationPage() {
  return (
    <Layout>
      <h1 className="sr-only">Request a consultation</h1>
      <RequestConsultation />
    </Layout>
  );
}