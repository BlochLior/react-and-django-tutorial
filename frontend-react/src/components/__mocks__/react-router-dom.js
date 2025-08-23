// This file is a mock for react-router-dom to control navigation in our tests.
// It is placed in the __mocks__ directory to be automatically used by jest.
const actual = jest.requireActual('react-router-dom');

module.exports = {
    ...actual,
    useNavigate: () => jest.fn(),
};