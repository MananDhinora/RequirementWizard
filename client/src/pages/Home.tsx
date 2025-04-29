import { useState } from "react";
import Layout from "@/components/Layout";
import ApiKeyForm from "@/components/ApiKeyForm";
import ProjectForm from "@/components/ProjectForm";
import DocumentOutput from "@/components/DocumentOutput";
import HelpModal from "@/components/HelpModal";

export default function Home() {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [apiKeyConnected, setApiKeyConnected] = useState(false);

  return (
    <Layout onHelpClick={() => setIsHelpModalOpen(true)}>
      <div className="max-w-7xl mx-auto">
        <ApiKeyForm 
          onApiKeyConnected={() => setApiKeyConnected(true)} 
          apiKeyConnected={apiKeyConnected}
        />
        
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          <ProjectForm />
          <DocumentOutput />
        </div>
      </div>
      {isHelpModalOpen && (
        <HelpModal onClose={() => setIsHelpModalOpen(false)} />
      )}
    </Layout>
  );
}
