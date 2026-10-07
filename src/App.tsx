import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { RoommateProvider } from '@/features/roommate/store'
import { BrowsePage } from '@/features/roommate/BrowsePage'
import { ChatPage } from '@/features/roommate/ChatPage'
import { CreatePage } from '@/features/roommate/CreatePage'
import { DonePage } from '@/features/roommate/DonePage'
import { MatchPage } from '@/features/roommate/MatchPage'
import { MinePage } from '@/features/roommate/MinePage'
import { AppLayout } from '@/layouts/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { ExplorePage } from '@/pages/find/ExplorePage'
import { ListingDetailPage } from '@/pages/find/ListingDetailPage'
import { CounselorPage } from '@/pages/home/CounselorPage'
import { HomePage } from '@/pages/home/HomePage'
import { ListingHostConsentPage } from '@/pages/mypage/ListingHostConsentPage'
import { ProfileEditPage } from '@/pages/mypage/ProfileEditPage'
import { ProfilePage } from '@/pages/mypage/ProfilePage'
import { ListingPreviewPage } from '@/pages/regist/ListingPreviewPage'

function App() {
  return (
    <AuthProvider>
      <RoommateProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/counselor" element={<CounselorPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/roommate" element={<BrowsePage />} />
          <Route path="/roommate/new" element={<CreatePage />} />
          <Route path="/roommate/done" element={<DonePage />} />
          <Route path="/roommate/mine" element={<MinePage />} />
          <Route path="/roommate/chat/:threadId" element={<ChatPage />} />
          <Route path="/roommate/match/:threadId" element={<MatchPage />} />
          <Route path="/explore/listing" element={<ListingPreviewPage />} />
          <Route path="/explore/listing/:listingId" element={<ListingDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/profile/edit"
            element={<Navigate to="/profile/edit/role" replace />}
          />
          <Route
            path="/profile/edit/host-consent"
            element={<ListingHostConsentPage />}
          />
          <Route path="/profile/edit/:step" element={<ProfileEditPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Routes>
      </RoommateProvider>
    </AuthProvider>
  )
}

export default App
