// ============================================================
// Result Model — SQL queries for result operations
// ============================================================
const { pool } = require('../config/db');

const Result = {
    // Create result
    create: async (resultData) => {
        const { student_id, exam_id, attempt_id, score, total_marks, percentage, grade, status, ai_feedback } = resultData;
        const [result] = await pool.execute(
            `INSERT INTO results (student_id, exam_id, attempt_id, score, total_marks, percentage, grade, status, ai_feedback) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, exam_id, attempt_id, score, total_marks, percentage, grade, status, ai_feedback || null]
        );
        return { id: result.insertId, ...resultData };
    },

    // Find all results with student and exam info
    findAll: async (search = '', page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        let query = `SELECT r.*, st.name as student_name, st.email as student_email,
                      e.exam_name, s.subject_name
                      FROM results r
                      JOIN students st ON r.student_id = st.id
                      JOIN exams e ON r.exam_id = e.id
                      JOIN subjects s ON e.subject_id = s.id`;
        let countQuery = `SELECT COUNT(*) as total FROM results r
                          JOIN students st ON r.student_id = st.id
                          JOIN exams e ON r.exam_id = e.id
                          JOIN subjects s ON e.subject_id = s.id`;
        const params = [];
        const countParams = [];

        if (search) {
            const searchClause = ' WHERE st.name LIKE ? OR e.exam_name LIKE ? OR s.subject_name LIKE ?';
            query += searchClause;
            countQuery += searchClause;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY r.created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

        const [rows] = await pool.execute(query, params);
        const [countResult] = await pool.execute(countQuery, countParams);

        return {
            results: rows,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    },

    // Find results by student ID
    findByStudentId: async (studentId) => {
        const [rows] = await pool.execute(
            `SELECT r.*, e.exam_name, s.subject_name, e.exam_date
             FROM results r
             JOIN exams e ON r.exam_id = e.id
             JOIN subjects s ON e.subject_id = s.id
             WHERE r.student_id = ?
             ORDER BY r.created_at DESC`,
            [studentId]
        );
        return rows;
    },

    // Find result by attempt ID
    findByAttemptId: async (attemptId) => {
        const [rows] = await pool.execute(
            `SELECT r.*, e.exam_name, s.subject_name, st.name as student_name
             FROM results r
             JOIN exams e ON r.exam_id = e.id
             JOIN subjects s ON e.subject_id = s.id
             JOIN students st ON r.student_id = st.id
             WHERE r.attempt_id = ?`,
            [attemptId]
        );
        return rows[0];
    },

    // Get pass/fail statistics
    getPassFailStats: async () => {
        const [rows] = await pool.execute(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pass' THEN 1 ELSE 0 END) as passed,
                SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END) as failed
             FROM results`
        );
        return rows[0];
    },

    // Get subject-wise performance
    getSubjectPerformance: async () => {
        const [rows] = await pool.execute(
            `SELECT s.subject_name, 
                    COUNT(r.id) as total_attempts,
                    ROUND(AVG(r.percentage), 2) as avg_percentage,
                    SUM(CASE WHEN r.status = 'pass' THEN 1 ELSE 0 END) as passed,
                    SUM(CASE WHEN r.status = 'fail' THEN 1 ELSE 0 END) as failed
             FROM results r
             JOIN exams e ON r.exam_id = e.id
             JOIN subjects s ON e.subject_id = s.id
             GROUP BY s.id, s.subject_name
             ORDER BY avg_percentage DESC`
        );
        return rows;
    },

    // Get monthly statistics
    getMonthlyStats: async () => {
        const [rows] = await pool.execute(
            `SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as total_exams,
                ROUND(AVG(percentage), 2) as avg_percentage
             FROM results
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY DATE_FORMAT(created_at, '%Y-%m')
             ORDER BY month ASC`
        );
        return rows;
    },

    // Get leaderboard
    getLeaderboard: async (examId = null, limit = 20) => {
        let query = `SELECT st.name as student_name, st.email,
                      ROUND(AVG(r.percentage), 2) as avg_percentage,
                      COUNT(r.id) as exams_taken,
                      SUM(CASE WHEN r.status = 'pass' THEN 1 ELSE 0 END) as passed
                     FROM results r
                     JOIN students st ON r.student_id = st.id`;
        const params = [];

        if (examId) {
            query += ' WHERE r.exam_id = ?';
            params.push(examId);
        }

        query += ` GROUP BY st.id, st.name, st.email
                   ORDER BY avg_percentage DESC
                   LIMIT ${Number(limit)}`;

        const [rows] = await pool.query(query, params);
        return rows;
    },

    // Get result by student and exam
    findByStudentAndExam: async (studentId, examId) => {
        const [rows] = await pool.execute(
            `SELECT r.*, e.exam_name, s.subject_name
             FROM results r
             JOIN exams e ON r.exam_id = e.id
             JOIN subjects s ON e.subject_id = s.id
             WHERE r.student_id = ? AND r.exam_id = ?`,
            [studentId, examId]
        );
        return rows[0];
    }
};

module.exports = Result;
