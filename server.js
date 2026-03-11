const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'traycee_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, emergencyContacts } = req.body;
    const connection = await pool.getConnection();

    const hashedPassword = await hashPassword(password);

    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      await connection.release();
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const userId = require('crypto').randomUUID();
    const now = new Date().toISOString();

    await connection.execute(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
      [userId, email, hashedPassword, now]
    );

    await connection.execute(
      'INSERT INTO profiles (id, name, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [userId, name || '', phone || '', now, now]
    );

    if (emergencyContacts && emergencyContacts.length > 0) {
      for (const contact of emergencyContacts) {
        const contactId = require('crypto').randomUUID();
        await connection.execute(
          'INSERT INTO emergency_contacts (id, user_id, name, phone, relationship, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [contactId, userId, contact.name, contact.phone, contact.relationship, now]
        );
      }
    }

    const token = generateToken(userId);

    const [userProfile] = await connection.execute(
      'SELECT id, name, email, phone FROM profiles p JOIN users u ON p.id = u.id WHERE p.id = ?',
      [userId]
    );

    await connection.release();

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: userProfile[0].id,
          name: userProfile[0].name,
          email: userProfile[0].email,
          phone: userProfile[0].phone,
          emergencyContacts: emergencyContacts || [],
          guardianMode: false,
          accessibilitySettings: {
            highContrast: false,
            textToSpeech: false,
            speechToText: false,
            colorBlindMode: 'none'
          }
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      'SELECT u.id, u.password_hash, p.name, p.phone, p.guardian_mode, p.accessibility_settings FROM users u JOIN profiles p ON u.id = p.id WHERE u.email = ?',
      [email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = users[0];
    const passwordMatch = await verifyPassword(password, user.password_hash);

    if (!passwordMatch) {
      await connection.release();
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const [emergencyContacts] = await connection.execute(
      'SELECT id, name, phone, relationship FROM emergency_contacts WHERE user_id = ?',
      [user.id]
    );

    const token = generateToken(user.id);

    await connection.release();

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: email,
          phone: user.phone || '',
          emergencyContacts: emergencyContacts || [],
          guardianMode: user.guardian_mode || false,
          accessibilitySettings: user.accessibility_settings || {
            highContrast: false,
            textToSpeech: false,
            speechToText: false,
            colorBlindMode: 'none'
          }
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      'SELECT u.id, u.email, p.name, p.phone, p.guardian_mode, p.accessibility_settings FROM users u JOIN profiles p ON u.id = p.id WHERE u.id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = users[0];

    const [emergencyContacts] = await connection.execute(
      'SELECT id, name, phone, relationship FROM emergency_contacts WHERE user_id = ?',
      [user.id]
    );

    await connection.release();

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        emergencyContacts: emergencyContacts || [],
        guardianMode: user.guardian_mode || false,
        accessibilitySettings: user.accessibility_settings || {
          highContrast: false,
          textToSpeech: false,
          speechToText: false,
          colorBlindMode: 'none'
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, guardianMode, accessibilitySettings, emergencyContacts } = req.body;
    const connection = await pool.getConnection();
    const now = new Date().toISOString();

    if (name !== undefined || phone !== undefined || guardianMode !== undefined || accessibilitySettings !== undefined) {
      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        values.push(phone);
      }
      if (guardianMode !== undefined) {
        updates.push('guardian_mode = ?');
        values.push(guardianMode);
      }
      if (accessibilitySettings !== undefined) {
        updates.push('accessibility_settings = ?');
        values.push(JSON.stringify(accessibilitySettings));
      }

      updates.push('updated_at = ?');
      values.push(now);
      values.push(req.userId);

      await connection.execute(
        `UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    if (emergencyContacts !== undefined) {
      await connection.execute('DELETE FROM emergency_contacts WHERE user_id = ?', [req.userId]);

      if (emergencyContacts.length > 0) {
        for (const contact of emergencyContacts) {
          const contactId = require('crypto').randomUUID();
          await connection.execute(
            'INSERT INTO emergency_contacts (id, user_id, name, phone, relationship, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [contactId, req.userId, contact.name, contact.phone, contact.relationship, now]
          );
        }
      }
    }

    const [users] = await connection.execute(
      'SELECT u.id, u.email, p.name, p.phone, p.guardian_mode, p.accessibility_settings FROM users u JOIN profiles p ON u.id = p.id WHERE u.id = ?',
      [req.userId]
    );

    const [emergencyContactsList] = await connection.execute(
      'SELECT id, name, phone, relationship FROM emergency_contacts WHERE user_id = ?',
      [req.userId]
    );

    await connection.release();

    const user = users[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        emergencyContacts: emergencyContactsList || [],
        guardianMode: user.guardian_mode || false,
        accessibilitySettings: user.accessibility_settings || {
          highContrast: false,
          textToSpeech: false,
          speechToText: false,
          colorBlindMode: 'none'
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/incidents', verifyToken, async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const connection = await pool.getConnection();

    const [incidents] = await connection.execute(
      'SELECT id, location, type, description, reported_by_name, verified, anonymous, created_at FROM incidents ORDER BY created_at DESC LIMIT ?',
      [parseInt(limit)]
    );

    await connection.release();

    res.json({
      success: true,
      data: incidents.map(incident => ({
        ...incident,
        location: JSON.parse(incident.location)
      }))
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/incidents', verifyToken, async (req, res) => {
  try {
    const { location, type, description, reportedBy, anonymous } = req.body;
    const connection = await pool.getConnection();
    const incidentId = require('crypto').randomUUID();
    const now = new Date().toISOString();

    await connection.execute(
      'INSERT INTO incidents (id, location, type, description, reported_by_id, reported_by_name, anonymous, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, false, ?)',
      [incidentId, JSON.stringify(location), type, description, anonymous ? null : req.userId, reportedBy, anonymous, now]
    );

    const [incident] = await connection.execute(
      'SELECT id, location, type, description, reported_by_name, verified, anonymous, created_at FROM incidents WHERE id = ?',
      [incidentId]
    );

    await connection.release();

    res.status(201).json({
      success: true,
      data: {
        ...incident[0],
        location: JSON.parse(incident[0].location)
      }
    });
  } catch (error) {
    console.error('Report incident error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/safety-zones', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [zones] = await connection.execute(
      'SELECT id, location, type, name, radius FROM safety_zones'
    );

    await connection.release();

    res.json({
      success: true,
      data: zones.map(zone => ({
        ...zone,
        location: JSON.parse(zone.location)
      }))
    });
  } catch (error) {
    console.error('Get safety zones error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/chat/messages', verifyToken, async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const connection = await pool.getConnection();

    const [messages] = await connection.execute(
      'SELECT id, user_id, user_name, message, type, channel, location, created_at FROM chat_messages ORDER BY created_at ASC LIMIT ?',
      [parseInt(limit)]
    );

    await connection.release();

    res.json({
      success: true,
      data: messages.map(msg => ({
        ...msg,
        location: msg.location ? JSON.parse(msg.location) : null
      }))
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/chat/send', verifyToken, async (req, res) => {
  try {
    const { message, type, channel, location } = req.body;
    const connection = await pool.getConnection();
    const messageId = require('crypto').randomUUID();
    const now = new Date().toISOString();

    const [users] = await connection.execute(
      'SELECT name FROM profiles WHERE id = ?',
      [req.userId]
    );

    const userName = users[0]?.name || 'Anonymous';

    await connection.execute(
      'INSERT INTO chat_messages (id, user_id, user_name, message, type, channel, location, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [messageId, req.userId, userName, message, type || 'message', channel || 'general', location ? JSON.stringify(location) : null, now]
    );

    await connection.release();

    res.status(201).json({
      success: true,
      data: { id: messageId }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/sos/trigger', verifyToken, async (req, res) => {
  try {
    const { location } = req.body;
    const connection = await pool.getConnection();
    const alertId = require('crypto').randomUUID();
    const now = new Date().toISOString();

    await connection.execute(
      'INSERT INTO sos_alerts (id, user_id, location, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [alertId, req.userId, JSON.stringify(location), 'active', now]
    );

    await connection.release();

    res.status(201).json({
      success: true,
      data: { id: alertId }
    });
  } catch (error) {
    console.error('Trigger SOS error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/sos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const connection = await pool.getConnection();
    const now = new Date().toISOString();

    const updateFields = ['status = ?'];
    const values = [status];

    if (status === 'resolved') {
      updateFields.push('resolved_at = ?');
      values.push(now);
    }

    values.push(id);
    values.push(req.userId);

    await connection.execute(
      `UPDATE sos_alerts SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    await connection.release();

    res.json({
      success: true,
      data: { id, status }
    });
  } catch (error) {
    console.error('Update SOS error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
