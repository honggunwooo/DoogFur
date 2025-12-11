import { useEffect, useMemo, useState } from "react"
import AIChat from "./components/AIChat"
import AuthPanel from "./components/AuthPanel"
import PostDetail from "./components/PostDetail"
import PostList from "./components/PostList"
import PostCreate from "./components/PostCreate"

const API_BASE = import.meta.env.VITE_API_URL || "/api"

const seedPosts = [
  {
    id: 1,
    title: "Next.js API Routes에서 CORS 오류",
    content: "로컬에서 프론트가 3000, 백엔드가 3001입니다. fetch로 POST 보내면 CORS 에러가 납니다. 어떻게 설정해야 할까요?",
    category: "Next.js",
    author: "admin@devforum.com",
    createdAt: "2024-08-01T12:00:00Z",
    views: 182,
    likes: 14,
    comments: [
      { id: 1, author: "devops@devforum.com", content: "백엔드에서 allow_origins에 http://localhost:3000 추가해보세요.", createdAt: "2024-08-01T12:30:00Z" },
    ],
  },
  {
    id: 2,
    title: "React에서 useEffect 의존성 배열 경고",
    content: "ESLint가 useEffect dependency를 추가하라고 해서 넣었더니 무한 요청이 납니다. fetch 로딩 플래그를 어떻게 관리하면 좋을까요?",
    category: "React",
    author: "user1@mail.com",
    createdAt: "2024-08-05T09:10:00Z",
    views: 96,
    likes: 9,
    comments: [
      { id: 1, author: "frontend@devforum.com", content: "의존성에 함수 넣지 말고 useCallback으로 감싸거나 내부에서 플래그 체크하세요.", createdAt: "2024-08-05T10:00:00Z" },
    ],
  },
  {
    id: 3,
    title: "JavaScript 이벤트 루프가 헷갈립니다",
    content: "Promise와 setTimeout 순서가 왜 이렇게 동작하는지 설명 부탁드려요.",
    category: "JavaScript",
    author: "jslover@mail.com",
    createdAt: "2024-07-22T11:00:00Z",
    views: 75,
    likes: 6,
    comments: [
      { id: 1, author: "senior@mail.com", content: "마이크로태스크 vs 매크로태스크 순서를 찾아보세요.", createdAt: "2024-07-22T12:30:00Z" },
    ],
  },
  {
    id: 4,
    title: "TypeScript 타입 가드 패턴 추천",
    content: "union 타입에서 안전하게 분기하는 방법을 알고 싶어요. 타입가드, satisfies, in 체크 등 추천해주세요.",
    category: "TypeScript",
    author: "tsfan@mail.com",
    createdAt: "2024-07-28T10:00:00Z",
    views: 54,
    likes: 5,
    comments: [],
  },
  {
    id: 5,
    title: "DevOps: CI/CD 파이프라인 캐시 전략",
    content: "Node 모노레포에서 캐시를 어디까지 가져가야 빌드 속도가 빨라질까요?",
    category: "DevOps",
    author: "devops@mail.com",
    createdAt: "2024-08-10T09:00:00Z",
    views: 41,
    likes: 4,
    comments: [
      { id: 1, author: "infra@mail.com", content: "pnpm 캐시 + Docker layer 캐시 조합 추천합니다.", createdAt: "2024-08-10T10:00:00Z" },
    ],
  },
  {
    id: 6,
    title: "React Server Components 도입 시 주의사항",
    content: "기존 CSR/SSR 혼용 프로젝트에 RSC를 넣을 때 흔히 겪는 문제를 공유해주세요.",
    category: "React",
    author: "rsc@mail.com",
    createdAt: "2024-08-15T14:00:00Z",
    views: 38,
    likes: 3,
    comments: [],
  },
  {
    id: 7,
    title: "Next.js App Router에서 동적 라우트 404",
    content: "app/[slug]/page.js에서 slug가 없을 때 커스텀 404 처리하는 방법이 궁금해요.",
    category: "Next.js",
    author: "nextdev@mail.com",
    createdAt: "2024-08-18T12:00:00Z",
    views: 29,
    likes: 2,
    comments: [],
  },
  {
    id: 8,
    title: "Node.js에서 스트림 처리 시 메모리 폭증",
    content: "대용량 파일을 스트림으로 처리하는데 메모리가 계속 올라갑니다. 백프레셔를 어떻게 적용해야 할까요?",
    category: "Node.js",
    author: "node@mail.com",
    createdAt: "2024-08-20T09:00:00Z",
    views: 44,
    likes: 3,
    comments: [
      { id: 1, author: "backend@mail.com", content: "pipeline + highWaterMark 조절을 검토해보세요.", createdAt: "2024-08-20T10:00:00Z" },
    ],
  },
  {
    id: 9,
    title: "Python FastAPI에서 CORS 설정",
    content: "프론트 5173, 백엔드 8000일 때 OPTIONS preflight가 실패합니다. fastapi-cors 설정이 궁금해요.",
    category: "Python",
    author: "py@mail.com",
    createdAt: "2024-08-21T11:00:00Z",
    views: 51,
    likes: 4,
    comments: [],
  },
  {
    id: 10,
    title: "Go fiber에서 context cancel 처리",
    content: "요청이 취소될 때 goroutine을 어떻게 정리하는 게 좋나요?",
    category: "Go",
    author: "go@mail.com",
    createdAt: "2024-08-22T13:00:00Z",
    views: 29,
    likes: 2,
    comments: [],
  },
  {
    id: 11,
    title: "Rust tokio에서 async trait 패턴",
    content: "async_trait 매크로 없이 깔끔하게 async trait를 정의하는 방법이 있을까요?",
    category: "Rust",
    author: "rustacean@mail.com",
    createdAt: "2024-08-23T15:00:00Z",
    views: 21,
    likes: 2,
    comments: [],
  },
  {
    id: 12,
    title: "SQL 쿼리 튜닝: 인덱스 설계",
    content: "조회가 느린 테이블에 어떤 인덱스를 추가해야 할지 감이 없습니다. 카디널리티와 커버링 인덱스 조언 부탁드려요.",
    category: "SQL",
    author: "data@mail.com",
    createdAt: "2024-08-24T10:30:00Z",
    views: 33,
    likes: 3,
    comments: [],
  },
  {
    id: 13,
    title: "AWS Lambda 콜드스타트 최적화",
    content: "Node18 런타임에서 콜드스타트가 길어요. 레이어/프로비저닝 팁이 있나요?",
    category: "AWS",
    author: "cloud@mail.com",
    createdAt: "2024-08-25T08:30:00Z",
    views: 26,
    likes: 2,
    comments: [],
  },
  {
    id: 14,
    title: "Docker 멀티스테이지 빌드 최적화",
    content: "React 빌드 후 Nginx 이미지를 만드는 Dockerfile을 간소화하고 싶습니다.",
    category: "Docker",
    author: "ops@mail.com",
    createdAt: "2024-08-26T09:30:00Z",
    views: 27,
    likes: 2,
    comments: [],
  },
  {
    id: 15,
    title: "Kubernetes Ingress 404 문제",
    content: "ingress-nginx에서 특정 path만 404가 뜹니다. rewrite-target 설정이 맞는지 확인 부탁드립니다.",
    category: "Kubernetes",
    author: "k8s@mail.com",
    createdAt: "2024-08-27T12:00:00Z",
    views: 24,
    likes: 1,
    comments: [],
  },
]

function Landing({ onStart }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="brand">DogFur</div>
          <div className="subtitle">오늘은 {new Date().toLocaleDateString()}</div>
        </div>
        <div className="auth-actions">
          <button className="btn primary" onClick={onStart}>
            커뮤니티 열기
          </button>
        </div>
      </header>

      <div className="landing-hero">
        <div className="hero-panel">
          <div className="hero-badge">DEVFORUM</div>
          <h1 className="hero-title">개발자 Q&A + AI 코드 도우미</h1>
          <p className="hero-text">
            막힌 코드, 에러 로그, 설계 고민까지. 게시글과 댓글을 AI가 읽고 바로 답변합니다.
          </p>
          <div className="hero-tags">
            <span>#React</span>
            <span>#API</span>
            <span>#Debug</span>
            <span>#BestPractice</span>
          </div>
          <button className="btn primary cta-btn" onClick={onStart}>
            커뮤니티 열기
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [posts, setPosts] = useState(seedPosts)
  const [selectedPostId, setSelectedPostId] = useState(seedPosts[0]?.id || null)
  const [users, setUsers] = useState([{ email: "admin@devforum.com", password: "admin", username: "관리자" }])
  const [currentUser, setCurrentUser] = useState(null)
  const [authMode, setAuthMode] = useState("login")
  const [showApp, setShowApp] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [overlayPostId, setOverlayPostId] = useState(null)
  const categories = ["전체", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Go", "Rust", "SQL", "AWS", "Docker", "Kubernetes", "DevOps"]
  const [selectedCategory, setSelectedCategory] = useState("전체")

  // Persist minimal auth state locally for convenience
  useEffect(() => {
    const storedUser = localStorage.getItem("dogtur_user")
    const storedUsers = localStorage.getItem("dogtur_users")
    const landingSeen = localStorage.getItem("dogtur_landing_seen")
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    }
    if (landingSeen === "true") {
      setShowApp(true)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("dogtur_users", JSON.stringify(users))
    if (currentUser) {
      localStorage.setItem("dogtur_user", JSON.stringify(currentUser))
    } else {
      localStorage.removeItem("dogtur_user")
    }
  }, [users, currentUser])

  const selectedPost = useMemo(() => posts.find((p) => p.id === selectedPostId) || null, [posts, selectedPostId])
  const overlayPost = useMemo(() => posts.find((p) => p.id === overlayPostId) || null, [posts, overlayPostId])
  const filteredPosts = useMemo(
    () => (selectedCategory === "전체" ? posts : posts.filter((p) => p.category === selectedCategory)),
    [posts, selectedCategory],
  )

  if (!showApp) {
    return (
      <Landing
        onStart={() => {
          localStorage.setItem("dogtur_landing_seen", "true")
          setShowApp(true)
        }}
      />
    )
  }

  const handleLogin = (email, password) => {
    const user = users.find((u) => u.email === email && u.password === password)
    if (user) {
      setCurrentUser({ email: user.email, username: user.username })
      setShowAuthModal(false)
      return { ok: true }
    }
    return { ok: false, message: "이메일 혹은 비밀번호를 확인해주세요." }
  }

  const handleSignup = (username, email, password) => {
    if (users.some((u) => u.email === email)) {
      return { ok: false, message: "이미 사용 중인 이메일입니다." }
    }
    const newUser = { username, email, password }
    setUsers((prev) => [...prev, newUser])
    setCurrentUser({ email, username })
    setShowAuthModal(false)
    return { ok: true }
  }

  const handleLogout = () => setCurrentUser(null)

  const handleCreatePost = (title, content) => {
    if (!currentUser) return { ok: false, message: "로그인 후 작성 가능합니다." }
    const newPost = {
      id: Date.now(),
      title,
      content,
      author: currentUser.email,
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: [],
    }
    setPosts((prev) => [newPost, ...prev])
    setSelectedPostId(newPost.id)
    return { ok: true }
  }

  const handleAddComment = (postId, text) => {
    if (!currentUser) return { ok: false, message: "로그인 후 댓글 작성 가능합니다." }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now(),
                  author: currentUser.email,
                  content: text,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : post,
      ),
    )
    return { ok: true }
  }

  const handleSelectPost = (id) => {
    setSelectedPostId(id)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="brand">DogFur</div>
          <div className="subtitle">오늘은 {new Date().toLocaleDateString()}</div>
        </div>
        <div className="auth-actions">
          {currentUser ? (
            <>
              <span className="user-chip">{currentUser.email}</span>
              <button className="btn ghost" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <div className="auth-toggle">
              <button
                className={`btn ghost ${authMode === "login" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("login")
                  setShowAuthModal(true)
                }}
              >
                로그인
              </button>
              <button
                className={`btn ghost ${authMode === "signup" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("signup")
                  setShowAuthModal(true)
                }}
              >
                회원가입
              </button>
            </div>
          )}
        </div>
      </header>

      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <AuthPanel mode={authMode} onLogin={handleLogin} onSignup={handleSignup} onSwitchMode={setAuthMode} />
          </div>
        </div>
      )}

      <main className="layout">
        <section className="posts-pane">
          <div className="card fill">
            <div className="card-header-row">
              <div className="card-header">게시글</div>
              <button className="btn ghost small" onClick={() => setShowCreate(true)} disabled={!currentUser}>
                게시글 작성
              </button>
            </div>
            <div className="posts-grid">
              <div className="cat-rail">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`cat-pill block ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="posts-column">
                <PostList
                  posts={filteredPosts}
                  selectedPostId={selectedPostId}
                  onSelect={handleSelectPost}
                  onOpenPost={(id) => setOverlayPostId(id)}
                />
                {!currentUser && <div className="hint">로그인하면 글 작성 및 댓글 작성이 가능합니다.</div>}
              </div>
            </div>
          </div>
        </section>

        <section className="ai-pane">
          <AIChat apiBase={API_BASE} selectedPost={selectedPost} currentUser={currentUser} />
        </section>
      </main>

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
            <PostCreate onCreate={handleCreatePost} currentUser={currentUser} onClose={() => setShowCreate(false)} />
          </div>
        </div>
      )}

      {overlayPost && (
        <div className="modal-backdrop" onClick={() => setOverlayPostId(null)}>
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-close">
              <button className="btn ghost small" onClick={() => setOverlayPostId(null)}>
                닫기
              </button>
            </div>
            <div className="overlay-layout">
              <div className="overlay-panel">
                <PostDetail post={overlayPost} onAddComment={handleAddComment} currentUser={currentUser} />
              </div>
              <div className="overlay-panel">
                <AIChat apiBase={API_BASE} selectedPost={overlayPost} currentUser={currentUser} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
