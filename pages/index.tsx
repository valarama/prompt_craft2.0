import React from 'react';
import Head from 'next/head';
import PromptCraftGenerator from '../components/prompt/PromptCraftGenerator';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>PromptCraft 2.0 - AI-Powered Prompt Engineering Platform</title>
        <meta name="description" content="Advanced prompt engineering platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <main>
        <PromptCraftGenerator />
      </main>
    </>
  );
};

export default HomePage;

