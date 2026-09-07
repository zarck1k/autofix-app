import Router from "./app/Router";
import { AuthProvider } from "./auth/AuthContext";  

const App = () => {
  return (
    <AuthProvider>      
      <Router />
    </AuthProvider>
  );
}

export default App;