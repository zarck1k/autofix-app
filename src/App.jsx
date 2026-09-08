import Router from "./app/Router";
import { AuthProvider } from "./Auth/AuthContext";  

const App = () => {
  return (
    <AuthProvider>      
      <Router />
    </AuthProvider>
  );
}

export default App;