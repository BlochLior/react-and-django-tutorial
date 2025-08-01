import './App.css'
import ClientPollPage from './features/client-poll/components/ClientPollPage/ClientPollPage';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Polls Site</h1>
      </header>
      <main>
        {/* components go here */}
        <ClientPollPage />
      </main>
    </div>      
  )   
}

export default App

// This is typically the root component, and the parent of most
// other components in a React application.

// Herein will the main layout be defined, navigation, and routing.
// For simple applications, initial development will be done here.