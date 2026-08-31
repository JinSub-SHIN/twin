import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/layouts/AppLayout'
import { ExplorePage } from '@/pages/ExplorePage'
import { HomePage } from '@/pages/HomePage'
import { ListingPreviewPage } from '@/pages/ListingPreviewPage'
import { LoginPage } from '@/pages/LoginPage'
import { ProfileEditPage } from '@/pages/ProfileEditPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SignupPage } from '@/pages/SignupPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/listing" element={<ListingPreviewPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/profile/edit"
            element={<Navigate to="/profile/edit/role" replace />}
          />
          <Route path="/profile/edit/:step" element={<ProfileEditPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
