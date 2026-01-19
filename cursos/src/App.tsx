import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EADAuthProvider } from './contexts/EADAuthContext';
import { Home } from './pages/Home';
import { Courses } from './pages/Courses';
import { CourseDetail } from './pages/CourseDetail';
import { Player } from './pages/Player';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <EADAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/cursos" element={<Courses />} />
          <Route path="/curso/:id" element={<CourseDetail />} />
          <Route
            path="/curso/:courseId/aula/:lessonId"
            element={
              <ProtectedRoute>
                <Player />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </EADAuthProvider>
  );
}

export default App;
