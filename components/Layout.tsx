import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/router";

interface LayoutProps {
  children: ReactNode;
  onHelpClick: () => void;
}

export default function Layout({ children, onHelpClick }: LayoutProps) {
  const { user, logoutMutation } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push("/auth-page");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" passHref>
            <h1 className="text-2xl font-bold text-primary cursor-pointer">PRD Generator</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onHelpClick} 
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              <QuestionMarkCircledIcon className="mr-2 h-4 w-4" />
              Help
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user.username}</span>
                <Button 
                  onClick={handleLogout} 
                  variant="outline"
                  className="text-gray-600"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            ) : (
              <Link href="/auth-page" passHref>
                <Button variant="outline">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      
      <footer className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PRD Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}