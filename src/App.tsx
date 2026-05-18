import AppNavigation from './navigation/AppNavigation.tsx';
import { AuthProvider } from './presentation/context/AuthContext.tsx';


function App() {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}

export default App;
