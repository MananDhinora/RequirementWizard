import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="px-4 py-2 bg-primary-50 -mx-4 -mt-4 rounded-t-lg border-b border-primary-100">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-medium text-primary-900">How to Use PRD Generator</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">1. Enter Your API Key</h4>
            <p className="text-sm text-gray-600">You'll need an OpenAI API key to use this tool. Enter it in the API Key field at the top of the page.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">2. Describe Your Project</h4>
            <p className="text-sm text-gray-600">Provide as much detail as possible about your project. The more information you provide, the better the generated document will be.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">3. Choose Output Options</h4>
            <p className="text-sm text-gray-600">Select your preferred output format and document type from the dropdown menus.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">4. Generate and Use</h4>
            <p className="text-sm text-gray-600">Click "Generate PRD" and wait for your document to be created. Once generated, you can copy or download it using the buttons above the document.</p>
          </div>
          
          <div className="rounded-md bg-yellow-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Your API key is stored in your browser session only and is never sent to our servers.</p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-3 bg-gray-50 -mx-4 -mb-4 rounded-b-lg flex justify-end">
          <Button onClick={onClose} className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}