import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header'; 
import PollsContainer from './pages/client/PollsContainer'; 
import ReviewPage from './pages/client/ReviewPage'; 
import AdminDashboard from './pages/admin/AdminDashboard'; 
import QuestionDetail from './pages/admin/QuestionDetail'; // Placeholder
import NewQuestionForm from './pages/admin/NewQuestionForm'; // Placeholder
import ResultsSummary from './pages/admin/ResultsSummary'; // Placeholder

import './App.css';

function App() {
    return (
      <Router>
        <Header /> {/* A simple header for navigation */}
        <main>
          <Routes>
            {/* Client Routes */}
            <Route path="/polls" element={<PollsContainer />} />
            <Route path="/polls/review" element={<ReviewPage />} />
  
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/new" element={<NewQuestionForm />} />
            <Route path="/admin/questions/summary" element={<ResultsSummary />} />
            <Route path="/admin/questions/:id" element={<QuestionDetail />} />
          </Routes>
        </main>
      </Router>
    );
  }
  
  export default App;