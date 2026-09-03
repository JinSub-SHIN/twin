import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/layouts/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { ExplorePage } from '@/pages/find/ExplorePage'
import { ListingDetailPage } from '@/pages/find/ListingDetailPage'
import { HomePage } from '@/pages/home/HomePage'
import { ProfileEditPage } from '@/pages/mypage/ProfileEditPage'
import { ProfilePage } from '@/pages/mypage/ProfilePage'
import { ListingPreviewPage } from '@/pages/regist/ListingPreviewPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/listing" element={<ListingPreviewPage />} />
          <Route path="/explore/listing/:listingId" element={<ListingDetailPage />} />
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
