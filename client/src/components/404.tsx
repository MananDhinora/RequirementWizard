import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

export default function NotFound() {
  return (
    <Layout onHelpClick={() => {}}>
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Page Not Found</h2>
          <p className="text-xl text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Link href="/" passHref>
            <Button size="lg">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}