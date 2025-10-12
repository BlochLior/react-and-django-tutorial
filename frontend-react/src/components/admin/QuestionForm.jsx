import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parseISO, isFuture, format } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  HStack,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
  IconButton
} from '@chakra-ui/react';
import { FaPlus, FaTrash } from 'react-icons/fa';

// Validation schema
const validationSchema = yup.object({
  question_text: yup
    .string()
    .required('Question text is required')
    .min(3, 'Question must be at least 3 characters'),
  pub_date: yup
    .string()
    .required('Publication date is required'),
  choices: yup
    .array()
    .of(
      yup.object({
        choice_text: yup
          .string()
          .notRequired() // Allow empty choice text
          .test('non-empty-if-provided', 'Choice cannot be empty', function(value) {
            // Only validate if value exists and is not just whitespace
            if (value && value.trim().length > 0) {
              return value.trim().length >= 1;
            }
            // Allow empty values
            return true;
          }),
      })
    )
    .min(0, 'Choices are optional - you can create questions without choices')
    .max(10, 'Maximum 10 choices allowed'),
});

const QuestionForm = ({
  title = 'Question Form',
  onSubmit,
  initialData = null,
  deleteButton = null,
  submitButtonText = 'Submit Question',
  isLoading = false,
}) => {

  // Set default values
  const defaultValues = {
    question_text: initialData?.question_text || '',
    pub_date: initialData?.pub_date || formatInTimeZone(new Date(), 'UTC', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    choices: initialData?.choices?.length > 0 
      ? initialData.choices 
      : [{ choice_text: '' }], // Start with one empty choice, user can add more or leave empty
  };

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'choices',
  });

  const watchedPubDate = watch('pub_date');
  const watchedChoices = watch('choices');

  // Generate notes
  const generateNotes = () => {
    const notes = [];
    
    // Check for choices
    const nonEmptyChoices = watchedChoices?.filter(choice => choice?.choice_text?.trim()).length || 0;
    const totalChoices = watchedChoices?.length || 0;
    
    if (nonEmptyChoices === 0) {
      // No non-empty choices
      if (totalChoices === 0) {
        notes.push({
          type: 'info',
          message: 'No choices provided - this will create a choiceless question.',
        });
      } else {
        notes.push({
          type: 'info',
          message: 'No choices provided - this will create a choiceless question.',
        });
      }
    }

    // Check for future date
    if (watchedPubDate) {
      try {
        const pubDateObj = parseISO(watchedPubDate);
        if (isFuture(pubDateObj)) {
          const zonedDate = toZonedTime(pubDateObj, 'UTC');
          notes.push({
            type: 'info',
            message: `Question is set to publish on ${format(zonedDate, 'yyyy-MM-dd')} at ${format(zonedDate, 'HH:mm')} UTC`,
          });
        }
      } catch (error) {
        // Invalid date, ignore
      }
    }

    return notes;
  };

  const handleFormSubmit = async (data) => {
    try {
      // Filter out empty choices
      const filteredChoices = data.choices.filter(choice => choice.choice_text?.trim());
      
      await onSubmit({
        ...data,
        choices: filteredChoices, // This can be an empty array for choiceless questions
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleDateChange = (date) => {
    if (!date) return setValue('pub_date', '');
    const isoUtc = formatInTimeZone(date, 'UTC', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    setValue('pub_date', isoUtc);
  };

  const selectedDate = watchedPubDate ? parseISO(watchedPubDate) : null;
  const notes = generateNotes();

  return (
    <Box maxW="600px" mx="auto" p={6} bg="white" borderRadius="lg" borderWidth={1} borderColor="gray.200">
      <Heading as="h1" size="lg" mb={6} textAlign="center" color="teal.500">
        {title}
      </Heading>

      <Box as="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack spacing={6} align="stretch">
          {/* Question Text Input */}
          <FormControl isInvalid={!!errors.question_text}>
            <FormLabel htmlFor="question_text">Question Text</FormLabel>
            <Input
              id="question_text"
              placeholder="Enter your question here..."
              {...register('question_text')}
            />
            <FormErrorMessage>
              {errors.question_text?.message}
            </FormErrorMessage>
          </FormControl>

          {/* Publication Date & Time */}
          <FormControl isInvalid={!!errors.pub_date}>
            <FormLabel htmlFor="pub_date">Publication Date & Time</FormLabel>
            <Box border="1px" borderColor="gray.200" borderRadius="md" p={2}>
              <DatePicker
                id="pub_date"
                selected={selectedDate}
                onChange={handleDateChange}
                showTimeSelect
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="Select date and time"
                customInput={<Input />}
              />
            </Box>
            <FormErrorMessage>
              {errors.pub_date?.message}
            </FormErrorMessage>
          </FormControl>

          {/* Choices Input */}
          <FormControl isInvalid={!!errors.choices}>
            <FormLabel>Choices</FormLabel>
            <VStack spacing={3} align="stretch">
              {fields.map((field, index) => (
                <HStack key={field.id} spacing={2}>
                  <FormControl isInvalid={!!errors.choices?.[index]?.choice_text} flex="1">
                    <Input
                      placeholder={`Choice ${index + 1}`}
                      {...register(`choices.${index}.choice_text`)}
                    />
                    <FormErrorMessage>
                      {errors.choices?.[index]?.choice_text?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  <IconButton
                    aria-label="Remove choice"
                    icon={<FaTrash />}
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                  />
                </HStack>
              ))}
              
              <Button
                leftIcon={<FaPlus />}
                onClick={() => append({ choice_text: '' })}
                variant="outline"
                colorScheme="teal"
                size="sm"
                alignSelf="flex-start"
              >
                Add Choice
              </Button>
            </VStack>
            <FormErrorMessage>
              {errors.choices?.message}
            </FormErrorMessage>
          </FormControl>

          {/* Notes Section */}
          {notes.length > 0 && (
            <VStack spacing={2} align="stretch">
              {notes.map((note, index) => (
                <Alert key={index} status={note.type} size="sm">
                  <AlertIcon />
                  <AlertDescription>{note.message}</AlertDescription>
                </Alert>
              ))}
            </VStack>
          )}

          {/* Action Buttons */}
          <HStack spacing={4} justify="flex-end">
            {deleteButton}
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting || isLoading}
              loadingText="Submitting..."
            >
              {submitButtonText}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default QuestionForm;