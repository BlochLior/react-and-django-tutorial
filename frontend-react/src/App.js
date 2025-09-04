import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@chakra-ui/react';
import Header from './components/layout/Header'; 
import PollsContainer from './pages/client/PollsContainer'; 
import ReviewPage from './pages/client/ReviewPage';
import SuccessPage from './pages/client/SuccessPage';
import AdminDashboard from './pages/admin/AdminDashboard'; 
import QuestionDetail from './pages/admin/QuestionDetail'; 
import NewQuestion from './pages/admin/NewQuestion'; 
import ResultsSummary from './pages/admin/ResultsSummary'; 

function App() {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Header />
      <Box as="main">
        <Container maxW="7xl" py={4}>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/polls" replace />} />
            {/* Client Routes */}
            <Route path="/polls" element={<PollsContainer />} />
            <Route path="/polls/review" element={<ReviewPage />} />
            <Route path="/success" element={<SuccessPage />} />
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
}

export default App;