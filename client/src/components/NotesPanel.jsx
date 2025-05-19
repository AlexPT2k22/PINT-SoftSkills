import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Save, X } from "lucide-react";
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
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleNewNote = async () => {
    if (!newNote.trim()) return;

    try {
      // Ensure we have the current time
      console.log("Creating note at time:", Math.floor(currentTime));

      // Pause the video first
      onPauseVideo();

      const response = await axios.post(
        "http://localhost:4000/api/notes",
        {
          moduleId,
          content: newNote,
          timeInSeconds: Math.floor(currentTime) || 0,
        },
        { withCredentials: true }
      );

      // Update notes list with the new note
      setNotes((prev) => [...prev, response.data]);
      setNewNote("");
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const jumpToTimestamp = (seconds) => {
    if (playerRef?.current) {
      playerRef.current.sendMessage({
        method: "seek",
        args: [seconds],
      });
    }
  };

  const handleEdit = async (noteId) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/notes/${noteId}`,
        { content: editText },
        { withCredentials: true }
      );
      setNotes(
        notes.map((note) => (note.ID_NOTA === noteId ? response.data : note))
      );
      setEditingNoteId(null);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await axios.delete(`http://localhost:4000/api/notes/${noteId}`, {
        withCredentials: true,
      });
      setNotes(notes.filter((note) => note.ID_NOTA !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="notes-panel">
      <div className="new-note mb-3">
        <textarea
          className="form-control mb-2"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Adicione uma nota..."
          rows={1}
          onFocus={onPauseVideo}
          onBlur={onResumeVideo}
        />
        <button
          className="btn btn-primary"
          onClick={handleNewNote}
          disabled={!newNote.trim()}
        >
          Adicionar Nota
        </button>
      </div>

      <div className="notes-list">
        {notes.map((note) => (
          <div key={note.ID_NOTA} className="note-item card mb-2">
            <div className="card-body">
              <div
                className="note-timestamp text-muted small mb-1"
                onClick={() => jumpToTimestamp(note.TEMPO_VIDEO)}
                style={{ cursor: "pointer" }}
              >
                {formatTime(note.TEMPO_VIDEO)}{" "}
                <span className="text-primary">(Jump to timestamp)</span>
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
