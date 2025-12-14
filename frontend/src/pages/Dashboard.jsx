import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import '../App.css';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';

function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // 1. Fetch notes when the page loads
    useEffect(() => {
        fetchNotes();
    }, []);

const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            fetchNotes(); // Reset to all notes if empty
            return;
        }

        setIsSearching(true);
        try {
            const response = await api.get(`/notes/search?query=${searchQuery}`);
            setNotes(response.data);
            toast.success(`Found ${response.data.length} relevant notes`);
        } catch (error) {
            console.error(error);
            toast.error("Search failed");
        } finally {
            setIsSearching(false);
        }
    };

const handleEdit = async (note) => {
        // Open SweetAlert Modal
        const { value: formValues } = await Swal.fire({
            title: 'Edit Note',
            html: `
                <input id="swal-input1" class="swal2-input" value="${note.title}" placeholder="Title">
                <textarea id="swal-input2" class="swal2-textarea" placeholder="Content" style="height: 100px;">${note.content}</textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            confirmButtonText: 'Update',
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value
                ];
            }
        });

        // If user clicked "Update"
        if (formValues) {
            const [newTitle, newContent] = formValues;

            // Optimistic UI update (update list immediately)
            // Or call API then update. Let's call API.
            try {
                // Assuming your backend supports PUT /notes/{id}
                const response = await api.put(`/notes/${note.id}`, {
                    title: newTitle,
                    content: newContent
                });

                // Update local state
                setNotes(notes.map(n => n.id === note.id ? response.data : n));

                // Show Toastr Success Message
                toast.success('Note updated successfully!');
            } catch (error) {
                console.error("Update failed", error);
                toast.error('Failed to update note.');
            }
        }
    };

    const fetchNotes = async () => {
            try {
                const response = await api.get('/notes');
                console.log("API Response:", response.data); // Debugging line

                // Only set notes if the data is actually an array
                if (Array.isArray(response.data)) {
                    setNotes(response.data);
                } else {
                    console.error("Unexpected data format:", response.data);
                    setNotes([]); // Fallback to empty array to prevent crash
                }
            } catch (error) {
                console.error("Error fetching notes:", error);
                if (error.response && error.response.status === 403) {
                    navigate('/login');
                }
            }
        };

    // 2. Create a new Note
    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!title || !content) return;

        try {
            await api.post('/notes', { title, content });
            // Clear form and refresh list
            setTitle('');
            setContent('');
            fetchNotes();
        } catch (error) {
            alert('Failed to save note');
        }
    };

    // 3. Delete a Note
    // --- NEW: DELETE FUNCTION WITH CONFIRMATION ---
        const handleDelete = async (id) => {
            // 1. Show Confirmation Dialog
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444', // Red color for danger
                cancelButtonColor: '#6366f1', // Indigo for cancel
                confirmButtonText: 'Yes, delete it!'
            });

            // 2. If User Confirmed
            if (result.isConfirmed) {
                try {
                    // Call API
                    await api.delete(`/notes/${id}`);

                    // Remove from UI immediately
                    setNotes(notes.filter(note => note.id !== id));

                    // Show Success Toast
                    toast.success('Note deleted successfully', {
                        icon: '🗑️',
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    });
                } catch (error) {
                    console.error("Delete failed", error);
                    toast.error('Failed to delete note.');
                }
            }
        };

    // 4. Logout
    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
            navigate('/login'); // Force redirect anyway
        }
    };

    return (
            <div className="container">
                <Toaster position="top-right" />
                {/* Header stays full width */}
                <header className="header">
                    <h1>My Notes</h1>
                    <button onClick={handleLogout} className="btn btn-danger">
                        Logout
                    </button>
                </header>

                {/* Main Layout: 2 Columns */}
                <div className="dashboard-layout">

                    {/* Left Column: Editor */}
                    <aside className="editor-section">
                        <form onSubmit={handleAddNote} className="note-form">
                            <h2 style={{margin: '0 0 1rem 0', fontSize: '1.2rem', color: 'var(--primary)'}}>
                                Add New Note
                            </h2>
                            <input
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="form-input"
                                required
                            />
                            <textarea
                                placeholder="Write your note here..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="form-textarea"
                                style={{minHeight: '150px'}} // Make it taller
                                required
                            />
                            <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
                                + Add Note
                            </button>
                        </form>
                    </aside>

                    {/* Right Column: Scrollable List */}
                    <main className="notes-section">
                        <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem', display: 'flex', gap: '10px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Search notes (e.g., 'Project ideas' or 'shopping list')..."
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    className="form-input"
                                                    style={{ flex: 1 }}
                                                />
                                                <button type="submit" className="btn btn-primary" disabled={isSearching}>
                                                    {isSearching ? 'Thinking...' : 'AI Search'}
                                                </button>
                                                {searchQuery && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => { setSearchQuery(''); fetchNotes(); }}
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </form>
                        {Array.isArray(notes) && notes.length > 0 ? (
                            notes.slice().reverse().map(note => ( // reverse() shows newest first
                                <div key={note.id} className="note-card">
                                    <div>
                                        <h3 className="note-title">{note.title}</h3>
                                        <p className="note-content" style={{whiteSpace: 'pre-wrap'}}>
                                            {/* pre-wrap preserves line breaks from the textarea */}
                                            {note.content}
                                        </p>
                                    </div>

                                    <div className="note-footer">
                                        <small className="note-date">
                                            {new Date(note.createdAt).toLocaleDateString(undefined, {
                                                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </small>
                                        <div className="note-actions">
                                            <button
                                                onClick={() => handleEdit(note)}
                                                className="icon-btn edit-btn"
                                                title="Edit Note"
                                            >
                                                <FaPencilAlt />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(note.id)}
                                                className="icon-btn delete-btn"
                                                title="Delete Note"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '4rem' }}>
                                <p>No notes found.</p>
                                <p>Use the form on the left to create one!</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        );
}

export default Dashboard;