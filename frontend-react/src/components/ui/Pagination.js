import { 
  Box, 
  Button, 
  HStack, 
  Text, 
  IconButton
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function Pagination({ currentPage, totalPages, onPageChange, hasPrevious, hasNext }) {
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={4}>
      <HStack spacing={1}>
        <IconButton
          aria-label="Previous page"
          icon={<FaChevronLeft />}
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={!hasPrevious}
        />
        
        {generatePageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <Text key={`ellipsis-${index}`} px={2} color="gray.500">
                ...
              </Text>
            );
          }
          
          return (
            <Button
              key={page}
              size="sm"
              variant={page === currentPage ? 'solid' : 'outline'}
              colorScheme={page === currentPage ? 'teal' : 'gray'}
              onClick={() => onPageChange(page)}
              minW="40px"
            >
              {page}
            </Button>
          );
        })}
        
        <IconButton
          aria-label="Next page"
          icon={<FaChevronRight />}
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={!hasNext}
        />
      </HStack>
      
      <Text fontSize="sm" color="gray.600">
        Page {currentPage} of {totalPages}
      </Text>
    </Box>
  );
}
    
    export default Pagination;