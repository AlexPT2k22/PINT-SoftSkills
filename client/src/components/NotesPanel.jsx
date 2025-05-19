import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Save, X, Play } from "lucide-react";
import axios from "axios";
import "../styles/notes.css";

function NotesPanel({
  moduleId,
  currentTime,
  onPauseVideo,
  onResumeVideo,
  playerRef,
}) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchNotes();
  }, [moduleId]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/notes/module/${moduleId}`,
        { withCredentials: true }
      );
      // Sort notes by timestamp
      const sortedNotes = response.data.sort(
        (a, b) => a.TEMPO_VIDEO - b.TEMPO_VIDEO
      );
      setNotes(sortedNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleNewNote = async () => {
    if (!newNote.trim()) return;

    try {
      onPauseVideo();
      const response = await axios.post(
        "http://localhost:4000/api/notes",
        {
          moduleId,
          content: newNote,
          timeInSeconds: Math.floor(currentTime),
        },
        { withCredentials: true }
      );

      setNotes((prev) =>
        [...prev, response.data].sort((a, b) => a.TEMPO_VIDEO - b.TEMPO_VIDEO)
      );
      setNewNote("");
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await axios.delete(`http://localhost:4000/api/notes/${noteId}`, {
        withCredentials: true,
      });
      setNotes((prev) => prev.filter((note) => note.ID_NOTA !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const jumpToTimestamp = (seconds) => {
    if (playerRef?.current) {
      // Send message to Cloudinary iframe
      playerRef.current.sendMessage({
        method: "seek",
        args: [seconds],
      });
      // Play the video after seeking
      setTimeout(() => {
        playerRef.current.sendMessage({
          method: "play",
        });
      }, 100);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingseconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingseconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="notes-panel">
      <div className="new-note mb-3">
        <div className="d-flex align-items-center mb-2">
          <span className="current-time me-2">
            Current time: {formatTime(currentTime)}
          </span>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onPauseVideo}
          >
            Pausa
          </button>
        </div>
        <textarea
          className="form-control mb-2"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Adicione uma nota neste instante..."
          rows={2}
        />
        <button
          className="btn btn-primary"
          onClick={handleNewNote}
          disabled={!newNote.trim()}
        >
          Adicionar nota
        </button>
      </div>

      <div className="notes-list">
        {notes.map((note) => (
          <div key={note.ID_NOTA} className="note-item card mb-2">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <button
                  className="btn btn-outline-primary btn-sm timestamp-btn"
                  onClick={() => jumpToTimestamp(note.TEMPO_VIDEO)}
                >
                  <Play size={14} className="me-1" />
                  {formatTime(note.TEMPO_VIDEO)}
                </button>
              </div>

              {editingNoteId === note.ID_NOTA ? (
                <div className="edit-note">
                  <textarea
                    className="form-control mb-2"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                  />
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleEdit(note.ID_NOTA)}
                    >
                      <Save size={16} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingNoteId(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-start">
                  <div className="note-content">{note.CONTEUDO}</div>
                  <div className="note-actions d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        setEditingNoteId(note.ID_NOTA);
                        setEditText(note.CONTEUDO);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(note.ID_NOTA)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotesPanel;
