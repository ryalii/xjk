import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Recurring from './pages/Recurring';
import CalendarPage from './pages/CalendarPage';
import Statistics from './pages/Statistics';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) {
    console.log('ErrorBoundary caught:', error);
    toast.error(`Something went wrong, please refresh the page`);
  }
  render() {
    return this.state.hasError
      ? <div className="p-8 text-center text-muted-foreground">Something went wrong — please refresh the page</div>
      : this.props.children as React.ReactElement;
  }
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar />
        {/* 64px offset for fixed navbar */}
        <div style={{ paddingTop: '64px' }}>
          <div className="page-container px-6 py-8">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/recurring" element={<Recurring />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/statistics" element={<Statistics />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
