import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.db');

// Add status column if it doesn't exist (migration)
const tableInfo = db.prepare("PRAGMA table_info(apartments)").all() as any[];
const statusExists = tableInfo.some(col => col.name === 'status');
if (!statusExists && tableInfo.length > 0) {
  db.exec("ALTER TABLE apartments ADD COLUMN status TEXT DEFAULT 'active'");
}

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS apartments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    price INTEGER NOT NULL,
    rating REAL NOT NULL,
    reviews INTEGER DEFAULT 0,
    images TEXT NOT NULL, -- JSON string array
    beds INTEGER NOT NULL,
    maxGuests INTEGER NOT NULL,
    baths INTEGER NOT NULL,
    sqm INTEGER NOT NULL,
    description TEXT,
    amenities TEXT, -- JSON string array
    type TEXT,
    bookedDates TEXT, -- JSON string array
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    apartmentId TEXT NOT NULL,
    userId TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    totalPrice INTEGER NOT NULL,
    status TEXT DEFAULT 'confirmed',
    FOREIGN KEY(apartmentId) REFERENCES apartments(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id TEXT NOT NULL,
    apartment_id TEXT NOT NULL,
    PRIMARY KEY(user_id, apartment_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(apartment_id) REFERENCES apartments(id)
  );
`);

// Seed initial data if empty
const count = db.prepare('SELECT count(*) as count FROM apartments').get() as { count: number };
if (count.count === 0) {
  const initialApartments = [
    {
      id: '1',
      title: 'Лофт "Modern Sky"',
      location: 'Астана, ул. Нур-Султан',
      price: 25000,
      rating: 4.8,
      reviews: 124,
      images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200']),
      beds: 1,
      maxGuests: 2,
      baths: 1,
      sqm: 45,
      description: 'Стильный и компактный лофт с потрясающим видом на Байтерек. Идеально подходит для деловых поездок и пар.',
      amenities: JSON.stringify(['Wi-Fi', 'Кухня', 'Кондиционер', 'Парковка']),
      type: 'Studio',
      bookedDates: JSON.stringify(['2024-05-10', '2024-05-11', '2024-05-12'])
    },
    {
      id: '2',
      title: 'Панорамный люкс EXPO',
      location: 'Астана, район EXPO',
      price: 45000,
      rating: 4.9,
      reviews: 86,
      images: JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200']),
      beds: 2,
      maxGuests: 4,
      baths: 2,
      sqm: 85,
      description: 'Просторные апартаменты с панорамными окнами и премиальной мебелью. Расположены в самом сердце района EXPO.',
      amenities: JSON.stringify(['Wi-Fi', 'Кухня', 'Кондиционер', 'Парковка', 'Бассейн', 'Спортзал']),
      type: 'Luxury',
      bookedDates: JSON.stringify(['2024-05-15', '2024-05-16'])
    },
    {
      id: '3',
      title: 'Уютное семейное гнездышко',
      location: 'Астана, Левый берег',
      price: 32000,
      rating: 4.7,
      reviews: 210,
      images: JSON.stringify(['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200']),
      beds: 2,
      maxGuests: 5,
      baths: 1,
      sqm: 65,
      description: 'Теплое и гостеприимное пространство для семей. Рядом с парками и торговыми центрами.',
      amenities: JSON.stringify(['Wi-Fi', 'Кухня', 'Стиральная машина', 'ТВ']),
      type: '2-Bedroom',
      bookedDates: JSON.stringify([])
    },
    {
      id: '4',
      title: 'Минималистичный городской оазис',
      location: 'Астана, проспект Республики',
      price: 18000,
      rating: 4.5,
      reviews: 45,
      images: JSON.stringify(['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200']),
      beds: 1,
      maxGuests: 2,
      baths: 1,
      sqm: 40,
      description: 'Чистые линии и функциональный дизайн для современного кочевника.',
      amenities: JSON.stringify(['Wi-Fi', 'Кухня', 'Рабочая зона']),
      type: '1-Bedroom',
      bookedDates: JSON.stringify(['2024-05-01', '2024-05-02', '2024-05-03', '2024-05-04'])
    }
  ];

  const insert = db.prepare(`
    INSERT INTO apartments (id, title, location, price, rating, reviews, images, beds, maxGuests, baths, sqm, description, amenities, type, bookedDates)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  initialApartments.forEach(apt => {
    insert.run(apt.id, apt.title, apt.location, apt.price, apt.rating, apt.reviews, apt.images, apt.beds, apt.maxGuests, apt.baths, apt.sqm, apt.description, apt.amenities, apt.type, apt.bookedDates);
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/apartments', (req, res) => {
    const isAdmin = req.query.admin === 'true';
    let rows;
    
    if (isAdmin) {
      // For admin, include booking count to determine if deletable
      rows = db.prepare(`
        SELECT a.*, (SELECT COUNT(*) FROM bookings b WHERE b.apartmentId = a.id) as bookingsCount 
        FROM apartments a
      `).all();
    } else {
      rows = db.prepare("SELECT * FROM apartments WHERE (status IS NULL OR status = 'active')").all();
    }
    
    const formatted = rows.map((row: any) => ({
      ...row,
      images: JSON.parse(row.images || '[]'),
      amenities: JSON.parse(row.amenities || '[]'),
      bookedDates: JSON.parse(row.bookedDates || '[]'),
      bookingsCount: row.bookingsCount || 0
    }));
    res.json(formatted);
  });

  app.get('/api/apartments/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM apartments WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ error: 'Not found' });
    
    res.json({
      ...row,
      images: JSON.parse(row.images),
      amenities: JSON.parse(row.amenities),
      bookedDates: JSON.parse(row.bookedDates)
    });
  });

  app.post('/api/apartments', (req, res) => {
    const { title, location, price, rating, reviews, images, beds, maxGuests, baths, sqm, description, amenities, type } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    
    db.prepare(`
      INSERT INTO apartments (id, title, location, price, rating, reviews, images, beds, maxGuests, baths, sqm, description, amenities, type, bookedDates)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title, location, price, rating, reviews || 0, 
      JSON.stringify(images || []), 
      beds, maxGuests, baths, sqm, description, 
      JSON.stringify(amenities || []), 
      type, JSON.stringify([])
    );
    
    res.status(201).json({ id });
  });

  app.patch('/api/apartments/:id/status', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE apartments SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true, status });
  });

  app.delete('/api/apartments/:id', (req, res) => {
    const id = req.params.id;
    try {
      // Check for active bookings
      const bookingsCount = db.prepare('SELECT count(*) as count FROM bookings WHERE apartmentId = ?').get(id) as { count: number };
      
      if (bookingsCount.count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete apartment with active bookings',
          code: 'HAS_BOOKINGS'
        });
      }

      // Cleanup favorites before deleting apartment
      db.prepare('DELETE FROM favorites WHERE apartment_id = ?').run(id);

      const result = db.prepare('DELETE FROM apartments WHERE id = ?').run(id);
      if (result.changes > 0) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Apartment not found' });
      }
    } catch (error: any) {
      console.error('Database delete error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Routes (Get all bookings)
  app.get('/api/admin/bookings', (req, res) => {
    const bookings = db.prepare(`
      SELECT b.*, a.title as apt_title, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN apartments a ON b.apartmentId = a.id
      JOIN users u ON b.userId = u.id
      ORDER BY b.startDate DESC
    `).all();
    res.json(bookings);
  });

  // Auth Routes
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    
    try {
      db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run(id, name, email, password);
      res.status(201).json({ id, name, email });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT id, name, email FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Неверный email или пароль' });
    }
  });

  app.put('/api/auth/profile', (req, res) => {
    const { id, name, email, password } = req.body;
    try {
      if (password) {
        db.prepare('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?').run(name, email, password, id);
      } else {
        db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
      }
      res.json({ id, name, email });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Booking Routes
  app.post('/api/bookings', (req, res) => {
    const { userId, apartmentId, startDate, endDate, totalPrice } = req.body;
    const id = 'b' + Math.random().toString(36).substr(2, 9);
    try {
      // 1. Insert booking
      db.prepare(`
        INSERT INTO bookings (id, apartmentId, userId, startDate, endDate, totalPrice)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, apartmentId, userId, startDate, endDate, totalPrice);
      
      // 2. Update apartment's bookedDates
      const apt = db.prepare('SELECT bookedDates FROM apartments WHERE id = ?').get(apartmentId) as any;
      const currentDates = JSON.parse(apt.bookedDates || '[]');
      
      // Calculate all dates between start and end
      const datesToBook = [];
      let current = new Date(startDate);
      const last = new Date(endDate);
      while(current <= last) {
        datesToBook.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      
      const newBookedDates = [...new Set([...currentDates, ...datesToBook])];
      db.prepare('UPDATE apartments SET bookedDates = ? WHERE id = ?').run(JSON.stringify(newBookedDates), apartmentId);

      res.status(201).json({ id, ...req.body });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/bookings/user/:userId', (req, res) => {
    const bookings = db.prepare(`
      SELECT b.*, a.title as apt_title, a.images as apt_images, a.location as apt_location
      FROM bookings b
      JOIN apartments a ON b.apartmentId = a.id
      WHERE b.userId = ?
    `).all(req.params.userId).map((b: any) => ({
      ...b,
      apt: {
        id: b.apartmentId,
        title: b.apt_title,
        images: JSON.parse(b.apt_images),
        location: b.apt_location
      }
    }));
    res.json(bookings);
  });

  // Favorites Routes
  app.post('/api/favorites/toggle', (req, res) => {
    const { userId, apartmentId } = req.body;
    const exists = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND apartment_id = ?').get(userId, apartmentId);
    
    if (exists) {
      db.prepare('DELETE FROM favorites WHERE user_id = ? AND apartment_id = ?').run(userId, apartmentId);
      res.json({ status: 'removed' });
    } else {
      db.prepare('INSERT INTO favorites (user_id, apartment_id) VALUES (?, ?)').run(userId, apartmentId);
      res.json({ status: 'added' });
    }
  });

  app.get('/api/favorites/user/:userId', (req, res) => {
    const favorites = db.prepare(`
      SELECT a.*
      FROM favorites f
      JOIN apartments a ON f.apartment_id = a.id
      WHERE f.user_id = ?
    `).all(req.params.userId).map((apt: any) => ({
      ...apt,
      images: JSON.parse(apt.images),
      amenities: JSON.parse(apt.amenities),
      bookedDates: JSON.parse(apt.bookedDates)
    }));
    res.json(favorites);
  });

  app.get('/api/favorites/check', (req, res) => {
    const { userId, apartmentId } = req.query;
    const exists = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND apartment_id = ?').get(userId, apartmentId);
    res.json({ isFavorite: !!exists });
  });

  // DB explorer endpoints (for the user to see the database)
  app.get('/api/debug/db/tables', (req, res) => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    res.json(tables);
  });

  app.get('/api/debug/db/tables/:name', (req, res) => {
    try {
      const rows = db.prepare(`SELECT * FROM ${req.params.name}`).all();
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/stats', (req, res) => {
    try {
      const totalRevenue = db.prepare('SELECT SUM(totalPrice) as total FROM bookings WHERE status != "cancelled"').get() as { total: number | null };
      const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get() as { count: number };
      const totalApartments = db.prepare('SELECT COUNT(*) as count FROM apartments WHERE status IS NULL OR status = "active"').get() as { count: number };
      const uniqueGuests = db.prepare('SELECT COUNT(DISTINCT userId) as count FROM bookings').get() as { count: number };
      
      // Monthly revenue (simplified)
      // We use cohesion to ensure we have some data even if empty
      const monthlyRevenue = db.prepare(`
        SELECT strftime('%Y-%m', startDate) as month, SUM(totalPrice) as total 
        FROM bookings 
        WHERE status != "cancelled" AND startDate IS NOT NULL
        GROUP BY month 
        ORDER BY month DESC 
        LIMIT 6
      `).all();

      // Apartment types distribution
      const typeDistribution = db.prepare(`
        SELECT type, COUNT(*) as count 
        FROM apartments 
        WHERE status != 'deleted'
        GROUP BY type
      `).all();

      res.json({
        totalRevenue: (totalRevenue && totalRevenue.total) || 0,
        totalBookings: (totalBookings && totalBookings.count) || 0,
        totalApartments: (totalApartments && totalApartments.count) || 0,
        uniqueGuests: uniqueGuests?.count || 0,
        monthlyRevenue: (monthlyRevenue || []).reverse(),
        typeDistribution: typeDistribution || []
      });
    } catch (error: any) {
      console.error('Stats fetch error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
