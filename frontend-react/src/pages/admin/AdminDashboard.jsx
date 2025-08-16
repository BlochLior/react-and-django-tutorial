import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminQuestionList from '../../components/admin/AdminQuestionList';
import Pagination from '../../components/ui/Pagination';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/';

const AdminDashboard = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Add state for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(0);

    const fetchQuestions = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            // Update the API call to include the page number
            const response = await axios.get(`${API_BASE_URL}admin/?page=${page}`);
            // eslint-disable-next-line no-unused-vars
            const { results, count, next: _next, previous: _previous } = response.data;
            
            setQuestions(results);
            setTotalQuestions(count);
            
            // Calculate total pages based on count and page size (default 10)
            setTotalPages(Math.ceil(count / 10)); // Assuming default page size of 10
            setCurrentPage(page);

        } catch (err) {
            setError('Error: Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchQuestions(newPage);
        }
    };

    if (loading) {
        return <div>Loading questions...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }
    
    // Calculate hasNext and hasPrevious based on current and total pages
    const hasNext = currentPage < totalPages;
    const hasPrevious = currentPage > 1;

    return (
        <div className="admin-dashboard-container">
            <h1>Admin Dashboard</h1>
            <p>Total Questions: {totalQuestions}</p>
            <Link to="/admin/new">
                <button className="add-question-btn">Add New Question</button>
            </Link>
            {questions && questions.length > 0 ? (
                <>
                    <AdminQuestionList questions={questions} />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        hasPrevious={hasPrevious}
                        hasNext={hasNext}
                    />
                </>
            ) : (
                <div>No questions available.</div>
            )}
        </div>
    );
};

export default AdminDashboard;