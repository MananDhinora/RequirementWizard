import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

export default function NotFound() {
  return (
    <Layout onHelpClick={() => {}}>
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="text-center">
          <h1 className="text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The page you are looking for might have been removed or is temporarily unavailable.
          </p>
          <Button asChild>
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}