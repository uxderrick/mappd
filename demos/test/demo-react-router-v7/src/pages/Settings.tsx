import { useState, useEffect } from 'react'

type Tab = 'general' | 'notifications' | 'security'

const tabs: { key: Tab; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'security', label: 'Security' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('general')

  useEffect(() => {
    console.log(`[Settings] tab switched to: ${activeTab}`)
    fetch(`https://jsonplaceholder.typicode.com/posts?_limit=3&_start=${tabs.findIndex(t => t.key === activeTab) * 3}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(`[Settings] fetched data for ${activeTab} tab`, data.length, 'items')
      })
      .catch((err) => console.error('[Settings] fetch error', err))
  }, [activeTab])

  const handleSwitch = (tab: Tab) => {
    setActiveTab(tab)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab${activeTab === tab.key ? ' tab-active' : ''}`}
            onClick={() => handleSwitch(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        {activeTab === 'general' && (
          <div>
            <h3 style={{ marginBottom: 16 }}>General Settings</h3>
            <div className="form-group">
              <label>Display Name</label>
              <input type="text" defaultValue="Demo User" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" defaultValue="demo@example.com" />
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <input type="text" defaultValue="UTC-5 (Eastern)" />
            </div>
            <button className="btn btn-primary">Save Changes</button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Notification Preferences</h3>
            <div className="toggle-row">
              <div className="toggle-label">
                <span>Email notifications</span>
                <button className="toggle active">
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
            <div className="toggle-row">
              <div className="toggle-label">
                <span>Push notifications</span>
                <button className="toggle">
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
            <div className="toggle-row">
              <div className="toggle-label">
                <span>Weekly digest</span>
                <button className="toggle active">
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
            <div className="toggle-row">
              <div className="toggle-label">
                <span>Marketing emails</span>
                <button className="toggle">
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Security Settings</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" placeholder="Enter current password" />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password" />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" />
            </div>
            <button className="btn btn-primary">Update Password</button>
            <div style={{ marginTop: 24, padding: 16, background: '#fef2f2', borderRadius: 8 }}>
              <h4 style={{ color: '#dc2626', marginBottom: 8 }}>Danger Zone</h4>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>
                Once you delete your account, there is no going back.
              </p>
              <button className="btn" style={{ background: '#dc2626', color: '#fff' }}>
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
