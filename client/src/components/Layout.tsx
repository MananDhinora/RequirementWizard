import { ReactNode } from "react";
import { FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
  onHelpClick: () => void;
}

export default function Layout({ children, onHelpClick }: LayoutProps) {
  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                PRD Generator
              </h1>
            </div>
            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onHelpClick}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full transition"
              >
                <HelpCircle className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <p className="mt-8 text-center md:mt-0 text-sm text-gray-500">
              &copy; {new Date().getFullYear()} PRD Generator. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
