import Layout from '@/components/Layout';
import Newsletter from '@/components/Newsletter';

export default function NewsletterPage() {
  return (
    <Layout>
      <h1 className="sr-only">Newsletter</h1>
      <Newsletter />
    </Layout>
  );
}