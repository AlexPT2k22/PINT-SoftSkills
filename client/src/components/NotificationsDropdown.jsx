// client/src/components/NotificationsDropdown.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Calendar, User, ExternalLink, CheckCheck } from "lucide-react";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function NotificationsDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();

      // Atualizar notificações a cada 2 minutos
      const interval = setInterval(() => {
        fetchNotifications();
      }, 120000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}/api/notificacoes`, {
        withCredentials: true,
      });

      if (response.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((notif) => !notif.LIDA).length);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${URL}/api/notificacoes/${notificationId}/read`,
        {},
        {
          withCredentials: true,
        }
      );

      // Atualizar estado local
      setNotifications(
        notifications.map((notif) =>
          notif.ID_NOTIFICACAO === notificationId
            ? { ...notif, LIDA: true }
            : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  // ✅ NOVO: Função para marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true);

      // Buscar todas as notificações não lidas do usuário
      const allNotificationsResponse = await axios.get(
        `${URL}/api/notificacoes`,
        {
          withCredentials: true,
        }
      );

      if (allNotificationsResponse.data) {
        const unreadNotifications = allNotificationsResponse.data.filter(
          (notif) => !notif.LIDA
        );

        // Marcar todas as não lidas como lidas
        const markAsReadPromises = unreadNotifications.map((notif) =>
          axios.put(
            `${URL}/api/notificacoes/${notif.ID_NOTIFICACAO}/read`,
            {},
            { withCredentials: true }
          )
        );

        await Promise.all(markAsReadPromises);

        // Atualizar estado local - marcar todas as notificações visíveis como lidas
        setNotifications(
          notifications.map((notif) => ({ ...notif, LIDA: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
      alert("Erro ao marcar notificações como lidas. Tente novamente.");
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "ALTERACAO_FORMADOR":
        return "👨‍🏫";
      case "ALTERACAO_DATA":
        return "📅";
      case "ALTERACAO_LINK_AULA":
        return "🔗";
      case "INSCRICAO":
        return "✅";
      case "NOVO_CONTEUDO":
        return "📚";
      case "NOVO_ANUNCIO":
        return "📢";
      default:
        return "📣";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return date.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.LIDA) {
      markAsRead(notification.ID_NOTIFICACAO);
    }

    switch (notification.TIPO) {
      case "ALTERACAO_LINK_AULA":
        navigate(
          `/dashboard/synchronous-course/${notification.CURSO?.ID_CURSO}?tab=aulas`
        );
        break;
      case "NOVO_ANUNCIO":
        navigate(
          `/dashboard/synchronous-course/${notification.CURSO?.ID_CURSO}?tab=anuncios`
        );
        break;
      default:
        navigate(`/course/${notification.CURSO?.ID_CURSO}`);
        break;
    }

    setShowDropdown(false);
  };

  return (
    <div className="notifications-dropdown-wrapper">
      <button
        className="btn btn-link nav-link position-relative"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ border: "none", background: "none" }}
      >
        <Bell strokeWidth={1.5} color="#39639C" size={22} />
        {unreadCount > 0 && (
          <span className="badge rounded-pill bg-danger notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h6 className="mb-0">Notificações</h6>

            {/* ✅ ATUALIZADO: Botão de marcar todas como lidas */}
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm text-primary p-0"
                type="button"
                onClick={markAllAsRead}
                disabled={markingAllAsRead}
                style={{ fontSize: "12px", textDecoration: "none" }}
              >
                {markingAllAsRead ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                    >
                      <span className="visually-hidden">A carregar...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCheck size={14} className="me-1" />
                    Marcar como lidas
                  </>
                )}
              </button>
            )}

            {loading && (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">A carregar...</span>
              </div>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={32} className="text-muted mb-2" />
                <p className="text-muted mb-0">Não há notificações</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.ID_NOTIFICACAO}
                  className={`notification-item ${
                    !notification.LIDA ? "unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.TIPO)}
                  </div>
                  <div className="notification-content">
                    <h6 className="notification-title">
                      {notification.TITULO}
                    </h6>
                    <p className="notification-message">
                      {notification.MENSAGEM}
                    </p>
                    <div className="notification-meta">
                      <span className="notification-time">
                        <Calendar size={12} className="me-1" />
                        {formatDate(notification.DATA_CRIACAO)}
                      </span>
                      {notification.CURSO && (
                        <span className="notification-course">
                          <ExternalLink size={12} className="me-1" />
                          {notification.CURSO.NOME}
                        </span>
                      )}
                    </div>
                  </div>
                  {!notification.LIDA && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop para fechar dropdown */}
      {showDropdown && (
        <div
          className="notifications-backdrop"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

export default NotificationsDropdown;
