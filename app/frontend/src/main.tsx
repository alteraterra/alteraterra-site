import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadRuntimeConfig } from './lib/config.ts';
import { loadSiteContent, setBootedContent } from './content/loadSiteContent.ts';

// Load runtime configuration before rendering the app
async function initializeApp() {
  try {
    await loadRuntimeConfig();
    console.log('Runtime configuration loaded successfully');
  } catch (error) {
    console.warn(
      'Failed to load runtime configuration, using defaults:',
      error
    );
  }

  // Load the editable site-content blob before first paint and stash it in a
  // module singleton. We cannot mount <SiteContentProvider> here because it must
  // live INSIDE <LanguageProvider> (which is in App.tsx) so useContent() can call
  // t(). So we hand the blob to App via setBootedContent(); App reads it with
  // getBootedContent() and mounts the provider in the right place.
  // loadSiteContent() never throws and self-degrades to {} on timeout/error.
  setBootedContent(await loadSiteContent());

  // Render the app
  createRoot(document.getElementById('root')!).render(<App />);
}

// Initialize the app
initializeApp();
