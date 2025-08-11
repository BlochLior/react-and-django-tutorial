import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminQuestionList from '../../components/admin/AdminQuestionList';
import { Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/'; // Use environment variable

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}admin/`);
        const fetchedQuestions = response.data.results; 
        setQuestions(fetchedQuestions);
      } catch (err) {
        setError('Error: Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return <div>Loading questions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      <Link to="/admin/new">
        <button className="add-question-btn">Add New Question</button>
      </Link>
      {questions && questions.length > 0 ? (
        <AdminQuestionList questions={questions} />
      ) : (
        <div>No questions available.</div>
      )}
    </div>
  );
};

export default AdminDashboard;