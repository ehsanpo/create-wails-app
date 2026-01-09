import { useState, useEffect } from 'react'
import {DatabaseService} from "../bindings/changeme";

/**
 * DatabaseDemo Component
 * Demonstrates SQLite database operations with a user management interface
 * 
 * Note: Database requires CGO which is disabled during 'wails3 dev'
 * Build for production to test: wails3 build
 */
function DatabaseDemo() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [dbMessage, setDbMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const userList = await DatabaseService.ListUsers();
      setUsers(userList || []);
      setDbMessage('');
    } catch (error) {
      console.error('Failed to load users:', error);
      if (error.message && error.message.includes('CGO_ENABLED=0')) {
        setDbMessage('⚠️ Database requires production build. Run: wails3 build');
      } else {
        setDbMessage('Failed to load users: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userName || !userEmail) return;
    
    try {
      setIsLoading(true);
      await DatabaseService.AddUser(userName, userEmail);
      setUserName('');
      setUserEmail('');
      setDbMessage(`✅ User "${userName}" added successfully!`);
      await loadUsers();
    } catch (error) {
      console.error('Failed to add user:', error);
      if (error.message && error.message.includes('CGO_ENABLED=0')) {
        setDbMessage('⚠️ Database requires production build. Run: wails3 build');
      } else {
        setDbMessage('❌ Failed to add user: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <h2>SQLite Database Demo</h2>
      
      <div style={{ 
        background: '#ffcc00', 
        color: '#000', 
        padding: '0.75rem', 
        borderRadius: '4px',
        marginBottom: '1rem',
        fontSize: '0.9rem'
      }}>
        ⚠️ <strong>Note:</strong> SQLite requires CGO which is disabled in dev mode.
        <br />
        To test database features, run: <code>wails3 build</code> then run the .exe from build/bin/
      </div>
      
      <form onSubmit={handleAddUser} style={{ marginBottom: '1rem' }}>
        <div className="input-box">
          <input 
            className="input" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)} 
            type="text" 
            placeholder="Name"
            autoComplete="off"
            disabled={isLoading}
          />
          <input 
            className="input" 
            value={userEmail} 
            onChange={(e) => setUserEmail(e.target.value)} 
            type="email" 
            placeholder="Email"
            autoComplete="off"
            style={{ marginLeft: '0.5rem' }}
            disabled={isLoading}
          />
          <button className="btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add User'}
          </button>
        </div>
      </form>
      
      {dbMessage && (
        <div style={{ 
          color: dbMessage.startsWith('✅') ? '#00d9ff' : '#ff6b6b', 
          marginBottom: '1rem' 
        }}>
          {dbMessage}
        </div>
      )}
      
      <div>
        <h3>Users ({users.length})</h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No users yet. Add one above!</p>
        ) : (
          <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', listStyle: 'none', padding: 0 }}>
            {users.map((user) => (
              <li key={user.id} style={{ 
                marginBottom: '0.75rem', 
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '4px'
              }}>
                <div><strong>{user.name}</strong> - {user.email}</div>
                <small style={{ color: '#888' }}>ID: {user.id} | Created: {user.createdAt}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DatabaseDemo;
