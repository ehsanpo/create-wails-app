// SQLite Database Example - TypeScript
// This file demonstrates how to use the database functions from the frontend
//
// IMPORTANT: SQLite requires CGO which is disabled during 'wails3 dev'
// To test database features, build for production: wails3 build
// Then run the executable from build/bin/

import { DatabaseService } from '../bindings/changeme/models';

/**
 * Add a new user to the database
 */
export async function addUser(name: string, email: string) {
  try {
    const db = new DatabaseService();
    const userId = await db.AddUser(name, email);
    console.log('User added with ID:', userId);
    return userId;
  } catch (error) {
    console.error('Failed to add user:', error);
    throw error;
  }
}

/**
 * Get all users from the database
 */
export async function getAllUsers() {
  try {
    const db = new DatabaseService();
    const users = await db.ListUsers();
    console.log('Retrieved users:', users);
    return users;
  } catch (error) {
    console.error('Failed to get users:', error);
    throw error;
  }
}

/**
 * Example: Add sample users and display them
 */
export async function databaseExample() {
  try {
    // Add some sample users
    await addUser('John Doe', 'john@example.com');
    await addUser('Jane Smith', 'jane@example.com');
    
    // Get all users
    const users = await getAllUsers();
    
    // Display users
    users.forEach((user: any) => {
      console.log(`User ${user.id}: ${user.name} (${user.email})`);
    });
    
    return users;
  } catch (error) {
    console.error('Database example failed:', error);
  }
}

// Example usage in a React component:
/*
import { useState, useEffect } from 'react';
import { getAllUsers, addUser } from './database-example';

function UserList() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const userList = await getAllUsers();
    setUsers(userList);
  }

  async function handleAddUser(e) {
    e.preventDefault();
    try {
      await addUser(name, email);
      setName('');
      setEmail('');
      await loadUsers();
    } catch (error) {
      alert('Failed to add user');
    }
  }

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
      
      <form onSubmit={handleAddUser}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}
*/
