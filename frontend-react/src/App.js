import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header'; 
import PollsContainer from './pages/client/PollsContainer'; 
import ReviewPage from './pages/client/ReviewPage'; 
import AdminDashboard from './pages/admin/AdminDashboard'; 
import QuestionDetail from './pages/admin/QuestionDetail'; 
import NewQuestion from './pages/admin/NewQuestion'; 
import ResultsSummary from './pages/admin/ResultsSummary'; 

import './App.css';

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* Client Routes */}
          <Route path="/polls" element={<PollsContainer />} />
          <Route path="/polls/review" element={<ReviewPage />} />
          {/* Admin Routes */}
          <Route path="/admin/" element={<AdminDashboard />} />
          <Route path="/admin/new/" element={<NewQuestion />} />
          <Route path="/admin/results/" element={<ResultsSummary />} />
          <Route path="/admin/questions/:questionId/" element={<QuestionDetail />} />
        </Routes> 
      </main>
    </>
  );
}

export default App;