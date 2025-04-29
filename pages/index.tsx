import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyForm from "@/components/ApiKeyForm";
import ProjectForm from "@/components/ProjectForm";
import DocumentOutput from "@/components/DocumentOutput";
import DocumentList from "@/components/DocumentList";
import Layout from "@/components/Layout";
import HelpModal from "@/components/HelpModal";
import { NextPage } from "next";

const Home: NextPage = () => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [apiKeyConnected, setApiKeyConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  return (
    <Layout onHelpClick={() => setIsHelpModalOpen(true)}>
      <div className="max-w-7xl mx-auto">
        <ApiKeyForm 
          onApiKeyConnected={() => setApiKeyConnected(true)} 
          apiKeyConnected={apiKeyConnected}
        />
        
        <Tabs 
          defaultValue="create" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mb-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create">Create Document</TabsTrigger>
            <TabsTrigger value="list">Your Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="mt-6">
            <div className="lg:grid lg:grid-cols-2 lg:gap-6">
              <ProjectForm />
              <DocumentOutput />
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-6">
            <DocumentList />
          </TabsContent>
        </Tabs>
      </div>
      
      {isHelpModalOpen && (
        <HelpModal onClose={() => setIsHelpModalOpen(false)} />
      )}
    </Layout>
  );
};

export default Home;