import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    // 1. Fetch notes when the page loads
    useEffect(() => {
        fetchNotes();
    }, []);

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
    const handleDelete = async (id) => {
        try {
            await api.delete(`/notes/${id}`);
            // Remove from UI immediately without refreshing
            setNotes(notes.filter(note => note.id !== id));
        } catch (error) {
            alert('Failed to delete note');
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
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>My Notes</h1>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </header>

            {/* Create Note Form */}
            <form onSubmit={handleAddNote} style={styles.form}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={styles.input}
                />
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    style={styles.textarea}
                />
                <button type="submit" style={styles.addBtn}>Add Note</button>
            </form>

            {/* Notes Grid */}
            <div style={styles.grid}>
                {Array.isArray(notes) && notes.length > 0 ? (
                    notes.map(note => (
                        <div key={note.id} style={styles.card}>
                            <h3>{note.title}</h3>
                            <p>{note.content}</p>
                            <small style={{ color: '#666' }}>
                                Created: {new Date(note.createdAt).toLocaleDateString()}
                            </small>
                            <button
                                onClick={() => handleDelete(note.id)}
                                style={styles.deleteBtn}
                            >
                                Delete
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No notes found. Create one!</p>
                )}
            </div>
        </div>
    );
}

// Basic CSS-in-JS for layout
const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    logoutBtn: { padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' },
    input: { padding: '10px', fontSize: '16px' },
    textarea: { padding: '10px', fontSize: '16px', minHeight: '80px' },
    addBtn: { padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
    card: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: 'white', position: 'relative' },
    deleteBtn: { marginTop: '10px', padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
};

export default Dashboard;