import { type FormEvent, useState } from 'react';
import { useMappdNavigate } from '../hooks/useMappdNavigate';

const STEPS = ['Details', 'Team', 'Review'];

export default function CreateProjectPage() {
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const navigate = useMappdNavigate();

  const members = ['Alice Johnson', 'Bob Smith', 'Charlie Brown'];

  const toggleMember = (name: string) => {
    setSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/dashboard', { projectName, description, members: selectedMembers });
  };

  return (
    <div>
      <h2>Create Project</h2>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              height: 3,
              borderRadius: 2,
              background: i <= step ? '#6366f1' : '#e2e8f0',
              marginBottom: 6,
            }} />
            <div style={{ fontSize: 11, color: i <= step ? '#6366f1' : '#94a3b8', fontWeight: i === step ? 600 : 400 }}>
              {s}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Details */}
        {step === 0 && (
          <div className="card" style={{ padding: 20 }}>
            <div className="form-group">
              <label htmlFor="projectName">Project Name</label>
              <input id="projectName" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My Awesome Project" required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" rows={3} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <button type="button" className="btn btn-primary btn-full" onClick={() => setStep(1)}>Next: Add Team</button>
          </div>
        )}

        {/* Step 2: Team */}
        {step === 1 && (
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>Select team members for this project:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {members.map((name) => (
                <label key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', background: selectedMembers.includes(name) ? '#eef2ff' : '#fff' }}>
                  <input type="checkbox" checked={selectedMembers.includes(name)} onChange={() => toggleMember(name)} style={{ accentColor: '#6366f1' }} />
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{name[0]}</div>
                  <span style={{ fontSize: 14 }}>{name}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" className="btn" style={{ flex: 1, background: '#e2e8f0', color: '#1e293b' }} onClick={() => setStep(0)}>Back</button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(2)}>Next: Review</button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 2 && (
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0, fontSize: 16 }}>Review Your Project</h3>
            <div style={{ fontSize: 14, marginBottom: 8 }}><strong>Name:</strong> {projectName || '(unnamed)'}</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}><strong>Description:</strong> {description || '(none)'}</div>
            <div style={{ fontSize: 14, marginBottom: 16 }}><strong>Team:</strong> {selectedMembers.length > 0 ? selectedMembers.join(', ') : '(no members)'}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn" style={{ flex: 1, background: '#e2e8f0', color: '#1e293b' }} onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Project</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
