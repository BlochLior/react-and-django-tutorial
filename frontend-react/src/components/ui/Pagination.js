function Pagination({ currentPage, totalPages, onPageChange, hasPrevious, hasNext }) {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }
    return (
        <div className="pagination">
          <button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={!hasPrevious}
          >
            Previous
          </button>
    
          {pageNumbers.map(number => (
            <button 
              key={number} 
              onClick={() => onPageChange(number)}
              disabled={number === currentPage}
            >
              {number}
            </button>
          ))}
    
          <button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={!hasNext}
          >
            Next
          </button>
          <span> Page {currentPage} of {totalPages}</span>
        </div>
      );
    }
    
    export default Pagination;