import Layout from '@/components/Layout';
import Inspirations from '@/components/Inspirations';

export default function JournalPage() {
  return (
    <Layout>
      <h1 className="sr-only">Journal</h1>
      <Inspirations />
    </Layout>
  );
}