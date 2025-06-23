import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, User, MessageCircle, Calendar, Edit, Trash2 } from 'lucide-react';
import useAuthStore from '../store/authStore';

const CourseReviews = ({ courseId, isEnrolled = false }) => {
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ estrelas: 0, comentario: '' });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { user } = useAuthStore();

  // fetch reviews
  const fetchReviews = async (pageNum = 1, reset = false) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/reviews/${courseId}?page=${pageNum}&limit=5`
      );

      if (response.data.success) {
        const newReviews = response.data.reviews;
        setReviews(prev => reset ? newReviews : [...prev, ...newReviews]);
        setStatistics(response.data.estatisticas);
        setHasMore(response.data.pagination.currentPage < response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Erro ao buscar reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // a minha review
  const fetchMyReview = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(
        `http://localhost:4000/api/reviews/${courseId}/my-review`,
        { withCredentials: true }
      );

      if (response.data.success && response.data.review) {
        setMyReview(response.data.review);
        setReviewForm({
          estrelas: response.data.review.ESTRELAS,
          comentario: response.data.review.COMENTARIO || ''
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Erro ao buscar minha review:', error);
      }
    }
  };

  useEffect(() => {
    fetchReviews(1, true);
    fetchMyReview();
  }, [courseId, user]);

  // Submeter review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewForm.estrelas === 0) {
      alert('Por favor, selecione uma classificação de estrelas');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:4000/api/reviews/${courseId}`,
        reviewForm,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMyReview(response.data.review);
        setShowReviewForm(false);
        fetchReviews(1, true); // Atualizar lista de reviews
      }
    } catch (error) {
      console.error('Erro ao submeter review:', error);
      alert(error.response?.data?.message || 'Erro ao submeter review');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar review
  const handleDeleteReview = async () => {
    if (!confirm('Tem certeza que deseja eliminar a sua avaliação?')) return;

    try {
      await axios.delete(
        `http://localhost:4000/api/reviews/${courseId}`,
        { withCredentials: true }
      );

      setMyReview(null);
      setReviewForm({ estrelas: 0, comentario: '' });
      fetchReviews(1, true);
    } catch (error) {
      console.error('Erro ao eliminar review:', error);
      alert('Erro ao eliminar review');
    }
  };

  // Componente de estrelas
  const StarRating = ({ rating, onRatingChange, readonly = false, size = 20 }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="d-flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`me-1 ${readonly ? '' : 'cursor-pointer'}`}
            fill={
              star <= (hover || rating) 
                ? '#FFD700' 
                : 'transparent'
            }
            color="#FFD700"
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            onClick={() => !readonly && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  // Componente de estatísticas
  const ReviewStatistics = () => {
    if (!statistics) return null;

    const { mediaEstrelas, totalReviews, distribuicao } = statistics;

    return (
      <div className="review-statistics mb-4">
        <div className="row">
          <div className="col-md-4">
            <div className="text-center">
              <h2 className="display-4 fw-bold text-warning">{mediaEstrelas}</h2>
              <StarRating rating={Math.round(parseFloat(mediaEstrelas))} readonly size={24} />
              <p className="text-muted">{totalReviews} avaliação{totalReviews !== 1 ? 'ões' : ''}</p>
            </div>
          </div>
          <div className="col-md-8">
            <h6>Distribuição das avaliações</h6>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribuicao[star] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={star} className="d-flex align-items-center mb-1">
                  <span className="me-2">{star}</span>
                  <Star size={16} fill="#FFD700" color="#FFD700" className="me-2" />
                  <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <small className="text-muted">{count}</small>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="course-reviews">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <MessageCircle size={24} className="me-2" />
          Avaliações dos alunos
        </h4>
        
        {isEnrolled && user && (
          <div>
            {myReview ? (
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowReviewForm(true)}
                >
                  <Edit size={16} className="me-1" />
                  Editar avaliação
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleDeleteReview}
                >
                  <Trash2 size={16} className="me-1" />
                  Eliminar
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowReviewForm(true)}
              >
                <Star size={16} className="me-1" />
                Avaliar curso
              </button>
            )}
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <ReviewStatistics />

      {/* Formulário de review */}
      {showReviewForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">
              {myReview ? 'Editar Avaliação' : 'Avaliar Curso'}
            </h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <label className="form-label">Classificação *</label>
                <StarRating
                  rating={reviewForm.estrelas}
                  onRatingChange={(rating) => 
                    setReviewForm(prev => ({ ...prev, estrelas: rating }))
                  }
                  size={32}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Comentário (opcional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Partilhe a sua experiência com este curso..."
                  value={reviewForm.comentario}
                  onChange={(e) => 
                    setReviewForm(prev => ({ ...prev, comentario: e.target.value }))
                  }
                />
              </div>
              
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || reviewForm.estrelas === 0}
                >
                  {submitting ? 'A submeter...' : myReview ? 'Atualizar' : 'Submeter'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* a minha review (se existir) */}
      {myReview && !showReviewForm && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0">A sua avaliação</h6>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <StarRating rating={myReview.ESTRELAS} readonly />
                <small className="text-muted d-block mt-1">
                  <Calendar size={14} className="me-1" />
                  {new Date(myReview.DATA_CRIACAO).toLocaleDateString('pt-PT')}
                  {myReview.DATA_ATUALIZACAO && ' (editado)'}
                </small>
              </div>
            </div>
            {myReview.COMENTARIO && (
              <p className="mb-0">{myReview.COMENTARIO}</p>
            )}
          </div>
        </div>
      )}

      {/* Lista de reviews */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="text-center py-4">
            <MessageCircle size={48} className="text-muted mb-3" />
            <h6>Ainda não há avaliações</h6>
            <p className="text-muted">
              Seja o primeiro a avaliar este curso!
            </p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <div key={review.ID_REVIEW} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center">
                      <User size={20} className="text-muted me-2" />
                      <div>
                        <h6 className="mb-0">{review.UTILIZADOR.NOME}</h6>
                        <StarRating rating={review.ESTRELAS} readonly />
                      </div>
                    </div>
                    <small className="text-muted">
                      <Calendar size={14} className="me-1" />
                      {new Date(review.DATA_CRIACAO).toLocaleDateString('pt-PT')}
                      {review.DATA_ATUALIZACAO && ' (editado)'}
                    </small>
                  </div>
                  {review.COMENTARIO && (
                    <p className="mb-0 mt-2">{review.COMENTARIO}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Botão carregar mais */}
            {hasMore && (
              <div className="text-center">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchReviews(nextPage);
                  }}
                >
                  Carregar mais avaliações
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseReviews;