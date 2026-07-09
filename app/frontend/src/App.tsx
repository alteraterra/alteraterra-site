import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { SiteContentProvider } from '@/content/SiteContentContext';
import { getBootedContent } from '@/content/loadSiteContent';
import LoadingSpinner from '@/components/LoadingSpinner';
import SiteHead from '@/components/SiteHead';
import Index from './pages/Index';

const PreludePage = lazy(() => import('./pages/PreludePage'));
const ArticlePage = lazy(() => import('./components/ArticlePage'));
const TheHousePage = lazy(() => import('./pages/TheHousePage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const NewsletterPage = lazy(() => import('./pages/NewsletterPage'));
const EnquirePage = lazy(() => import('./pages/EnquirePage'));
const MeetTheTeamPage = lazy(() => import('./pages/MeetTheTeamPage'));
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'));
const TeamProfilePage = lazy(() => import('./pages/TeamProfilePage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const AuthError = lazy(() => import('./pages/AuthError'));

const LoginPage = lazy(() => import('./admin/LoginPage'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const DashboardPage = lazy(() => import('./admin/DashboardPage'));
const ArticlesList = lazy(() => import('./admin/articles/ArticlesList'));
const ArticleEditor = lazy(() => import('./admin/articles/ArticleEditor'));
const MediaLibrary = lazy(() => import('./admin/media/MediaLibrary'));
const RequireAdmin = lazy(() => import('./admin/RequireAdmin'));

// Site-content editors (scaffolded in the next phase).
const SiteIndex = lazy(() => import('./admin/site/SiteIndex'));
const HomeEditor = lazy(() => import('./admin/site/HomeEditor'));
const HouseEditor = lazy(() => import('./admin/site/HouseEditor'));
const TeamEditor = lazy(() => import('./admin/site/TeamEditor'));
const ProfilesEditor = lazy(() => import('./admin/site/ProfilesEditor'));
const StatsEditor = lazy(() => import('./admin/site/StatsEditor'));
const ConsultEditor = lazy(() => import('./admin/site/ConsultEditor'));
const FooterEditor = lazy(() => import('./admin/site/FooterEditor'));
const LegalEditor = lazy(() => import('./admin/site/LegalEditor'));
const SeoEditor = lazy(() => import('./admin/site/SeoEditor'));
const GlobalsEditor = lazy(() => import('./admin/site/GlobalsEditor'));
// MODULE_IMPORTS_START
// MODULE_IMPORTS_END

const queryClient = new QueryClient();

// Site-content blob loaded at boot in main.tsx (module singleton hand-off).
// Read here so <SiteContentProvider> can mount INSIDE <LanguageProvider>, which
// is required because useContent().text() calls t() from useLanguage().
const INITIAL = getBootedContent();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      {/* MODULE_PROVIDERS_START */}
      {/* MODULE_PROVIDERS_END */}
      <LanguageProvider>
        <SiteContentProvider initial={INITIAL}>
        <SiteHead />
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/prelude" element={<PreludePage />} />
                <Route path="/the-house" element={<TheHousePage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/journal/:slug" element={<ArticlePage />} />
                <Route path="/newsletter" element={<NewsletterPage />} />
                <Route path="/enquire" element={<EnquirePage />} />
                <Route path="/meet-the-team" element={<MeetTheTeamPage />} />
                <Route path="/consultation" element={<ConsultationPage />} />
                <Route path="/team/:slug" element={<TeamProfilePage />} />
                <Route path="/privacy" element={<LegalPage kind="privacy" />} />
                <Route path="/terms" element={<LegalPage kind="terms" />} />

                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/error" element={<AuthError />} />

                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                  <Route index element={<DashboardPage />} />
                  <Route path="articles" element={<ArticlesList />} />
                  <Route path="articles/new" element={<ArticleEditor />} />
                  <Route path="articles/:id" element={<ArticleEditor />} />
                  <Route path="media" element={<MediaLibrary />} />
                  <Route path="site">
                    <Route index element={<SiteIndex />} />
                    <Route path="home" element={<HomeEditor />} />
                    <Route path="the-house" element={<HouseEditor />} />
                    <Route path="team" element={<TeamEditor />} />
                    <Route path="profiles" element={<ProfilesEditor />} />
                    <Route path="stats" element={<StatsEditor />} />
                    <Route path="consult" element={<ConsultEditor />} />
                    <Route path="footer" element={<FooterEditor />} />
                    <Route path="legal" element={<LegalEditor />} />
                    <Route path="seo" element={<SeoEditor />} />
                    <Route path="globals" element={<GlobalsEditor />} />
                  </Route>
                </Route>
                {/* MODULE_ROUTES_START */}
                {/* MODULE_ROUTES_END */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
        </SiteContentProvider>
      </LanguageProvider>
      {/* MODULE_PROVIDERS_CLOSE */}
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
