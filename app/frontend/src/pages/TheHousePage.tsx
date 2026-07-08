import Layout from '@/components/Layout';
import TheHouse from '@/components/TheHouse';

export default function TheHousePage() {
  return (
    <Layout>
      <h1 className="sr-only">The House, services</h1>
      <TheHouse />
    </Layout>
  );
}