import { useState } from 'react';
import Head from 'next/head';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiKeyForm from '@/components/ApiKeyForm';
import ProjectForm from '@/components/ProjectForm';
import DocumentOutput from '@/components/DocumentOutput';
import DocumentList from '@/components/DocumentList';
import Layout from '@/components/Layout';

export default function Home() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [apiKeyConnected, setApiKeyConnected] = useState(false);

  const handleHelpClick = () => {
    setShowHelpModal(true);
  };

  return (
    <>
      <Head>
        <title>PRD Generator | Create Professional Project Requirement Documents</title>
        <meta 
          name="description" 
          content="Generate professional Project Requirement Documents (PRDs) instantly with our AI-powered tool." 
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout onHelpClick={handleHelpClick}>
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex flex-col space-y-6">
            <section className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
                Project Requirements Generator
              </h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
                Create professional project requirement documents using AI. Simply enter your project details below.
              </p>
            </section>

            <section className="mb-6">
              <ApiKeyForm
                onApiKeyConnected={() => setApiKeyConnected(true)}
                apiKeyConnected={apiKeyConnected}
              />
            </section>

            <Tabs defaultValue="create" className="w-full">
              <TabsList>
                <TabsTrigger value="create">Create Document</TabsTrigger>
                <TabsTrigger value="documents">Your Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <ProjectForm />
                  </div>
                  <div>
                    <DocumentOutput />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-4">
                <DocumentList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    </>
  );
}