import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header'; 
import GuestHomePage from './pages/GuestHomePage';
import ClientHomePage from './pages/ClientHomePage';
import AdminHomePage from './pages/AdminHomePage';
import PollsContainer from './pages/client/PollsContainer'; 
import ReviewPage from './pages/client/ReviewPage';
import SuccessPage from './pages/client/SuccessPage';
import AdminDashboard from './pages/admin/AdminDashboard'; 
import QuestionDetail from './pages/admin/QuestionDetail'; 
import NewQuestion from './pages/admin/NewQuestion'; 
import ResultsSummary from './pages/admin/ResultsSummary'; 

const AppContent = () => {
  const { loading, isAuthenticated, isAdmin, user } = useAuth();

  // Debug logging
  console.log('App render - loading:', loading, 'authenticated:', isAuthenticated, 'admin:', isAdmin, 'user:', user);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Header />
      <Box as="main">
        <Container maxW="7xl" py={4}>
          <Routes>
            {/* Root route with conditional rendering */}
            <Route path="/" element={
              !isAuthenticated ? <GuestHomePage /> :
              isAdmin ? <AdminHomePage /> : <ClientHomePage />
            } />
            {/* Client Routes */}
            <Route path="/polls" element={<PollsContainer />} />
            <Route path="/polls/review" element={<ReviewPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/results" element={<ResultsSummary />} />
            {/* Admin Routes */}
            <Route path="/admin/" element={<AdminDashboard />} />
            <Route path="/admin/new/" element={<NewQuestion />} />
            <Route path="/admin/results/" element={<ResultsSummary />} />
            <Route path="/admin/questions/:questionId/" element={<QuestionDetail />} />
          </Routes> 
        </Container>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;