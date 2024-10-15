const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const dbConfig = {
    host: 'localhost',
    user: 'root', // Update with your MySQL username
    password: 'password', // Update with your MySQL password
    database: 'stromšík' // Update with your database name
};

let connection;

const connectToDatabase = async () => {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL database.');
    } catch (err) {
        console.error('Database connection error:', err);
    }
};

connectToDatabase();

// Endpoints

// Get all students
app.get('/api/students', async (req, res) => {
    try {
        const [students] = await connection.query('SELECT * FROM students');
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students' });
    }
});

// Add a new student
app.post('/api/students', async (req, res) => {
    const { name, class_id } = req.body;
    try {
        const [result] = await connection.query('INSERT INTO students (name, class_id) VALUES (?, ?)', [name, class_id]);
        res.status(201).json({ id: result.insertId, name, class_id });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Error adding student' });
    }
});

// Delete a student
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await connection.query('DELETE FROM students WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Error deleting student' });
    }
});

// Get grades for a student
app.get('/api/students/:studentId/grades', async (req, res) => {
    const { studentId } = req.params;
    try {
        const [grades] = await connection.query('SELECT * FROM grades WHERE student_id = ?', [studentId]);
        res.json(grades);
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ message: 'Error fetching grades' });
    }
});

// Add a grade for a student
app.post('/api/students/:studentId/grades', async (req, res) => {
    const { studentId } = req.params;
    const { description, weight, grade_value } = req.body;
    try {
        const [result] = await connection.query(
            'INSERT INTO grades (student_id, description, weight, grade_value) VALUES (?, ?, ?, ?)',
            [studentId, description, weight, grade_value]
        );
        res.status(201).json({ id: result.insertId, studentId, description, weight, grade_value });
    } catch (error) {
        console.error('Error adding grade:', error);
        res.status(500).json({ message: 'Error adding grade' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
