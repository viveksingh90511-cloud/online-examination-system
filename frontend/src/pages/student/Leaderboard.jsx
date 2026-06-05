import { useState, useEffect } from 'react';
import { resultService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiAward } from 'react-icons/fi';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeaderboard(); }, []);

  const fetchLeaderboard = async () => {
    try { const res = await resultService.getLeaderboard(); setLeaders(res.data.data); }
    catch { toast.error('Failed to load leaderboard'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="animate-in">
      <div className="page-header"><h1><FiAward style={{ marginRight: '8px' }} /> Leaderboard</h1><p>Top performing students</p></div>

      {/* Top 3 Podium */}
      {leaders.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: '20px', marginBottom: '32px' }}>
          {[1, 0, 2].map(idx => (
            <div key={idx} className="card" style={{ width: '200px', textAlign: 'center', transform: idx === 0 ? 'scale(1.1)' : 'scale(1)', zIndex: idx === 0 ? 1 : 0 }}>
              <div className="card-body" style={{ padding: '24px 16px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{medals[idx]}</div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.125rem', margin: '0 auto 8px' }}>
                  {leaders[idx]?.student_name?.charAt(0)}
                </div>
                <h4 style={{ fontSize: '0.9rem' }}>{leaders[idx]?.student_name}</h4>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.25rem', margin: '8px 0' }}>{leaders[idx]?.avg_percentage}%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{leaders[idx]?.exams_taken} exams</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="card">
        <div className="card-header"><h4>Full Rankings</h4></div>
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Rank</th><th>Student</th><th>Avg Score</th><th>Exams Taken</th><th>Passed</th></tr></thead>
            <tbody>
              {leaders.length === 0 ? <tr><td colSpan="5" className="text-center" style={{ padding: '40px' }}>No data yet</td></tr> :
              leaders.map((l, i) => (
                <tr key={i}>
                  <td><span style={{ fontWeight: 700 }}>{i < 3 ? medals[i] : `#${i+1}`}</span></td>
                  <td style={{ fontWeight: 600 }}>{l.student_name}</td>
                  <td><span style={{ fontWeight: 700, color: 'var(--primary)' }}>{l.avg_percentage}%</span></td>
                  <td>{l.exams_taken}</td>
                  <td><span className="badge badge-success">{l.passed}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
