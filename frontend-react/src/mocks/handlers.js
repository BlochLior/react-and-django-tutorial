import { rest } from 'msw';

export const handlers = [
    // Mock GET request for a specific question
    rest.get('http://127.0.0.1:8000/admin/questions/:questionId/', (req, res, ctx) => { // TODO: check if this is the correct endpoint
      const { questionId } = req.params;
      if (questionId === '123') {
        return res(
          ctx.status(200),
          ctx.json({
            id: '123',
            question_text: 'What is your favorite color?',
            pub_date: '2025-08-12T13:05:43.000Z',
            choices: [
              { id: '1', choice_text: 'Red', votes: 0 },
              { id: '2', choice_text: 'Blue', votes: 0 },
            ],
          })
        );
      }
      return res(ctx.status(404));
    }),
  
    // Mock PUT request for updating a question
    rest.put('http://127.0.0.1:8000/admin/questions/:questionId/', (req, res, ctx) => { // TODO: check if this is the correct endpoint
      const { questionId } = req.params;
      const { question_text, choices } = req.body;
      if (questionId === '123' && question_text === 'What is your favorite color?Updated Question' && choices.length === 2) {
        return res(ctx.status(200), ctx.json({ id: '123' }));
      }
      return res(ctx.status(400));
    }),
  
    // Mock DELETE request for a question
    rest.delete('http://127.0.0.1:8000/admin/questions/:questionId/', (req, res, ctx) => { // TODO: check if this is the correct endpoint
      const { questionId } = req.params;
      if (questionId === '123') {
        return res(ctx.status(204));
      }
      return res(ctx.status(404));
    }),
  ];

  