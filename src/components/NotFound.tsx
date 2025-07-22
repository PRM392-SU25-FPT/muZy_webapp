import type React from "react"
import { Link } from "react-router-dom"
import { RoutePath } from "../routes/RoutePath"

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">🎵</div>
        <h1>404</h1>
        <h2>Trang không tìm thấy</h2>
        <p>Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
        <Link to={RoutePath.DASHBOARD} className="back-home-btn">
          <span>🏠</span>
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}

export default NotFound
